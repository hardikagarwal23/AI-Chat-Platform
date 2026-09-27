import React from 'react';

export default function ChatSidebar({
  sessions,
  sessionId,
  loading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 rounded-xl border border-gray-700 bg-[#0000009a] p-4 shadow-sm">
      <button
        className="w-full rounded-lg cursor-pointer bg-[#151824] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#151824d3] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onNewChat}
        disabled={loading}
      >
        + New Chat
      </button>

      <h3 className="m-0 text-sm font-semibold text-gray-900">
        History
      </h3>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No conversations yet.
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="mb-1 flex items-center gap-1"
            >
              <button
                onClick={() => onSelectSession(session.id)}
                disabled={loading}
                className={`min-w-0 flex-1 truncate rounded-md px-2.5 py-2 cursor-pointer text-left text-sm transition disabled:cursor-not-allowed ${
                  session.id === sessionId
                    ? 'bg-gray-400 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {session.title}
              </button>

              <button
                onClick={() => onDeleteSession(session.id)}
                disabled={loading}
                className="rounded-md px-2 py-1 text-lg cursor-pointer leading-none text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                title="Delete chat"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <small className="border-t border-gray-100 pt-3 text-xs text-gray-400">
        Guest session
      </small>
    </aside>
  );
}