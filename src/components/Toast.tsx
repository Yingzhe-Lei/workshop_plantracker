import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-900 text-emerald-50 border-emerald-800'
            : toast.type === 'error'
            ? 'bg-rose-900 text-rose-50 border-rose-800'
            : 'bg-stone-900 text-stone-50 border-stone-800'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}

        <span>{toast.text}</span>

        <button
          onClick={onDismiss}
          className="ml-2 text-stone-300 hover:text-white p-0.5 rounded-md cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
