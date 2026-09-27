import React from 'react';

export default function Navbar({ page, setPage }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-[#121831] px-6 md:px-[5%]">
      <div>
        <h1 className="m-0 text-xl font-semibold text-gray-900">
          AI Assistant
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Multi-provider AI chat platform
        </p>
      </div>

      <nav className="flex items-center gap-2">
        <button
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            page === 'chat'
              ? 'bg-purple-50 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          onClick={() => setPage('chat')}
        >
          Chat
        </button>

        <button
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            page === 'analytics'
              ? 'bg-purple-50 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          onClick={() => setPage('analytics')}
        >
          Analytics
        </button>
      </nav>
    </header>
  );
}