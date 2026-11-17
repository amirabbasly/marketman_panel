import React from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl m-4 flex flex-col">
        {title && (
          <div className="px-6 py-4 border-b border-gray-100 text-right font-semibold text-gray-900">
            {title}
            <button
              onClick={onClose}
              className="absolute left-6 top-4 text-gray-400 hover:text-gray-600"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
