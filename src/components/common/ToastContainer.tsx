/**
 * Toast Container Component
 * Displays all notifications
 */

import { Check, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore } from '../../utils/toastStore';

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const icons = {
    success: <Check size={16} strokeWidth={2.5} />,
    error: <AlertCircle size={16} strokeWidth={2.5} />,
    warning: <AlertTriangle size={16} strokeWidth={2.5} />,
    info: <Info size={16} strokeWidth={2.5} />,
  };

  const bgColors = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-bcp-brown',
  };

  const iconColors = {
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    error: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    info: 'bg-brown-50 text-bcp-brown dark:bg-bcp-brown/20 dark:text-brown-200',
  };

  return (
    <div
      className="fixed top-4 right-4 left-4 sm:left-auto z-[80] flex flex-col items-end gap-3 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            w-full sm:w-auto sm:min-w-[320px] max-w-md flex items-start gap-3 p-3.5 pr-3 rounded-xl
            bg-white dark:bg-dark-bg-card border border-gray-200/80 dark:border-dark-border border-l-4
            shadow-bcp-medium pointer-events-auto animate-slideUp
            ${bgColors[toast.type]}
          `}
        >
          <div className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg ${iconColors[toast.type]}`}>
            {icons[toast.type]}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium leading-snug text-gray-800 dark:text-gray-100">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="Fermer / Close"
            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-dark-bg-soft"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
