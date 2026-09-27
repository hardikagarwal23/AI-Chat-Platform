import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();


// Provider statistics
router.get('/provider-stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        provider,
        COUNT(*)::int AS total_requests,
        COUNT(*) FILTER (
          WHERE status = 'success'
        )::int AS success_count,
        COUNT(*) FILTER (
          WHERE status = 'error'
        )::int AS error_count,
        ROUND(AVG(latency_ms), 2)::float AS avg_latency_ms,
        COALESCE(SUM(prompt_tokens), 0)::int
          AS total_prompt_tokens,
        COALESCE(SUM(completion_tokens), 0)::int
          AS total_completion_tokens
      FROM chat_logs
      GROUP BY provider
      ORDER BY provider
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch provider statistics',
    });
  }
});


// Recent requests
router.get('/recent-logs', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        session_id,
        provider,
        model,
        prompt_tokens,
        completion_tokens,
        latency_ms,
        status,
        created_at
      FROM chat_logs
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch logs',
    });
  }
});

export default router;