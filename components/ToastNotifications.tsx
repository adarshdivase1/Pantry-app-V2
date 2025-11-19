import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Info } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

const ToastNotifications: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const newToast: ToastData = {
        id: crypto.randomUUID(),
        message: detail.message,
        type: detail.type || 'info',
      };
      
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('pantry-notification', handleNotification);
    return () => window.removeEventListener('pantry-notification', handleNotification);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center p-4 min-w-[300px] bg-white rounded-xl shadow-xl border border-slate-100 animate-in slide-in-from-right duration-300"
        >
          <div className={`p-2 rounded-lg mr-3 ${
            toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-sm">{toast.message}</p>
            <p className="text-xs text-slate-500">Just now</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications;