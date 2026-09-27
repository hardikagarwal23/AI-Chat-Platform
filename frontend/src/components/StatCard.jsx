import React from 'react';

export default function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <strong className="mt-2 block text-2xl font-semibold text-gray-900">
        {value}
      </strong>
    </div>
  );
}