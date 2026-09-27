import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function normalizeMath(text) {
  if (!text) return '';

  let normalized = text;

  normalized = normalized.replace(
    /\\\[((?:.|\n)*?)\\\]/g,
    (_, math) => `\n$$\n${math.trim()}\n$$\n`
  );

  normalized = normalized.replace(
    /\\\(((?:.|\n)*?)\\\)/g,
    (_, math) => `$${math.trim()}$`
  );

  return normalized;
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`mb-4 max-w-3xl rounded-xl px-4 py-3 ${
        isUser
          ? 'ml-auto border border-gray-800 bg-[#17171784] text-gray-200'
          : 'border border-gray-800 bg-[#17171784] text-gray-200 shadow-sm'
      }`}
    >
      {/* <strong className="text-sm font-semibold">
        {isUser ? 'You' : '✨'}
      </strong> */}

      <div className="message-content mt-2 text-sm leading-7">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {normalizeMath(message.content)}
        </ReactMarkdown>
      </div>

      {message.role === 'assistant' && !message.streaming && (
        <small className="mt-3 block text-xs text-gray-400">
          {message.prompt_tokens || 0} input /{' '}
          {message.completion_tokens || 0} output
        </small>
      )}
    </div>
  );
}