import { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, Power } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  tone?: 'danger' | 'accent';
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  busy = false,
  tone = 'danger',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onCancel();
      } else if (event.key === 'Tab') {
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const isDanger = tone === 'danger';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4 animate-fadeIn"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="modal-panel max-w-md animate-slideUp"
      >
        <div className={`h-1 ${isDanger ? 'bg-red-500' : 'bg-gradient-to-r from-bcp-orange to-bcp-brown'}`} />
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isDanger ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-bcp-orange/10 text-bcp-orange'}`}>
              {isDanger ? <Power size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 id="confirm-dialog-title" className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          </div>
          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="btn-outline"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              aria-busy={busy}
              className={`${isDanger ? 'btn-danger' : 'btn-primary'} disabled:cursor-wait`}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {busy ? '...' : confirmLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}