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
    success: <Check size={20} className="text-green-600" />,
    error: <AlertCircle size={20} className="text-red-600" />,
    warning: <AlertTriangle size={20} className="text-yellow-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg border shadow-lg
            pointer-events-auto animate-slideUp
            ${bgColors[toast.type]}
          `}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${textColors[toast.type]}`}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={`flex-shrink-0 text-gray-400 hover:text-gray-600`}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
