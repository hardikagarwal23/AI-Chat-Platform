import React from 'react';

export default function ChatInput({
  prompt,
  setPrompt,
  model,
  setModel,
  models,
  loading,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
    >
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
      >
        {models.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your message..."
        disabled={loading}
        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
      />

      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        onClick={()=>window.scrollTo({ top: 100, behavior: 'smooth' })}
        className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '...' : 'Send'}
      </button>
    </form>
  );
}