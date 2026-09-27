import React from 'react';

export default function AnalyticsPanel({
  title,
  children,
  className = '',
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        {title}
      </h3>

      {children}
    </div>
  );
}