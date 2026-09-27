import express from 'express';
import crypto from 'node:crypto';

import pool from '../db/pool.js';
import { getProvider } from '../providers/index.js';

const router = express.Router();


// Get user's sessions
router.get('/sessions', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      error: 'userId is required',
    });c
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, title, provider, model, created_at, updated_at
       FROM chat_sessions
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      sessions: rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch sessions',
    });
  }
});


// Get messages from a session
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         session_id,
         role,
         content,
         prompt_tokens,
         completion_tokens,
         latency_ms,
         model,
         provider,
         created_at
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [req.params.sessionId]
    );

    res.json({
      success: true,
      messages: rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch messages',
    });
  }
});


// Delete session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM chat_sessions WHERE id = $1',
      [req.params.sessionId]
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to delete session',
    });
  }
});


// Stream chat
router.post('/stream', async (req, res) => {
  const {
    prompt,
    model = 'gemini-2.5-flash',
    userId,
    sessionId,
  } = req.body;

  if (!prompt?.trim()) {
    return res.status(400).json({
      error: 'Prompt is required',
    });
  }

  const effectiveUserId = userId || 'anonymous';

  let currentSessionId = sessionId;

  const startTime = Date.now();

  let promptTokens = 0;
  let completionTokens = 0;
  let responseText = '';

  try {
    const providerInstance = getProvider(model);
    const provider = providerInstance.providerName;

    // Create session if this is a new conversation
    if (!currentSessionId) {
      currentSessionId =
        `sess_${crypto.randomBytes(8).toString('hex')}`;

      await pool.query(
        `INSERT INTO chat_sessions
         (id, user_id, title, provider, model)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          currentSessionId,
          effectiveUserId,
          prompt.trim().slice(0, 35),
          provider,
          model,
        ]
      );
    } else {
      await pool.query(
        `UPDATE chat_sessions
         SET updated_at = NOW(),
             provider = $1,
             model = $2
         WHERE id = $3`,
        [provider, model, currentSessionId]
      );
    }

    // SSE setup
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders();

    // Tell frontend which session is being used
    res.write(
      `data: ${JSON.stringify({
        type: 'session_init',
        sessionId: currentSessionId,
      })}\n\n`
    );

    // Load previous conversation
    const { rows } = await pool.query(
      `SELECT role, content
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [currentSessionId]
    );

    const messages = [
      ...rows,
      {
        role: 'user',
        content: prompt.trim(),
      },
    ];

    // Save user message
    await pool.query(
      `INSERT INTO chat_messages
       (session_id, role, content, model, provider)
       VALUES ($1, 'user', $2, $3, $4)`,
      [
        currentSessionId,
        prompt.trim(),
        model,
        provider,
      ]
    );

    // Call LLM
    const stream = providerInstance.streamChat(messages);

    // Stream response
    for await (const chunk of stream) {
      if (chunk.text) {
        responseText += chunk.text;
      }

      if (chunk.usage) {
        promptTokens = chunk.usage.promptTokens;
        completionTokens = chunk.usage.completionTokens;
      }

      res.write(
        `data: ${JSON.stringify(chunk)}\n\n`
      );
    }

    const latencyMs = Date.now() - startTime;

    // Save assistant response
    if (responseText) {
      await pool.query(
        `INSERT INTO chat_messages
         (
           session_id,
           role,
           content,
           prompt_tokens,
           completion_tokens,
           latency_ms,
           model,
           provider
         )
         VALUES ($1, 'assistant', $2, $3, $4, $5, $6, $7)`,
        [
          currentSessionId,
          responseText,
          promptTokens,
          completionTokens,
          latencyMs,
          model,
          provider,
        ]
      );
    }

    // Save analytics directly
    await pool.query(
      `INSERT INTO chat_logs
       (
         session_id,
         provider,
         model,
         prompt_tokens,
         completion_tokens,
         latency_ms,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        currentSessionId,
        provider,
        model,
        promptTokens,
        completionTokens,
        latencyMs,
        'success',
      ]
    );

    res.write(
      `data: ${JSON.stringify({
        done: true,
        latencyMs,
      })}\n\n`
    );

    res.end();

  } catch (err) {
    console.error('Chat error:', err);

    const latencyMs = Date.now() - startTime;

    // Save failed request to analytics
    try {
      await pool.query(
        `INSERT INTO chat_logs
         (
           session_id,
           provider,
           model,
           prompt_tokens,
           completion_tokens,
           latency_ms,
           status,
           error_message
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          currentSessionId || 'unknown',
          'unknown',
          model,
          promptTokens,
          completionTokens,
          latencyMs,
          'error',
          err.message,
        ]
      );
    } catch (logError) {
      console.error('Failed to save error log:', logError);
    }

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to generate response',
      });
    }

    res.write(
      `data: ${JSON.stringify({
        error: 'Failed to generate response',
      })}\n\n`
    );

    res.end();
  }
});

export default router;