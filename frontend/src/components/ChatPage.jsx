import React, { useEffect, useState } from 'react';

import ChatSidebar from './ChatSidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

const MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
  },
  {
    id: 'ministral-3b-2512',
    name: 'Mistral 3B 2512',
  },
];

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);

  const [userId] = useState(() => {
    let id = localStorage.getItem('ai_chat_user_id');

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ai_chat_user_id', id);
    }

    return id;
  });

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const res = await fetch(
        `/api/chat/sessions?userId=${userId}`
      );

      const data = await res.json();

      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMessages(id) {
    try {
      const res = await fetch(
        `/api/chat/sessions/${id}/messages`
      );

      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function selectSession(id) {
    if (loading) return;

    setSessionId(id);
    loadMessages(id);
  }

  function newChat() {
    if (loading) return;

    setSessionId(null);
    setMessages([]);
  }

  async function deleteSession(id) {
    try {
      await fetch(`/api/chat/sessions/${id}`, {
        method: 'DELETE',
      });

      setSessions((prev) =>
        prev.filter((session) => session.id !== id)
      );

      if (sessionId === id) {
        newChat();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!prompt.trim() || loading) return;

    const text = prompt.trim();

    setPrompt('');
    setLoading(true);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      streaming: true,
      prompt_tokens: 0,
      completion_tokens: 0,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      assistantMessage,
    ]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId,
          prompt: text,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let responseText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;

          const data = JSON.parse(
            line.replace('data:', '').trim()
          );

          if (data.type === 'session_init') {
            setSessionId(data.sessionId);
          }

          if (data.text) {
            responseText += data.text;

            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessage.id
                  ? {
                      ...message,
                      content: responseText,
                    }
                  : message
              )
            );
          }

          if (data.usage) {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessage.id
                  ? {
                      ...message,
                      prompt_tokens:
                        data.usage.promptTokens,
                      completion_tokens:
                        data.usage.completionTokens,
                    }
                  : message
              )
            );
          }
        }
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                streaming: false,
              }
            : message
        )
      );

      await loadSessions();
    } catch (err) {
      console.error(err);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                streaming: false,
                content: 'Failed to generate response.',
              }
            : message
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-11/12 flex h-[calc(100vh-80px)]  gap-5 p-6">
      <ChatSidebar
        sessions={sessions}
        sessionId={sessionId}
        loading={loading}
        onNewChat={newChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  How can I help you today?
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Ask anything using Gemini or Mistral.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))
          )}
        </div>

        <ChatInput
          prompt={prompt}
          setPrompt={setPrompt}
          model={model}
          setModel={setModel}
          models={MODELS}
          loading={loading}
          onSubmit={sendMessage}
        />
      </main>
    </div>
  );
}