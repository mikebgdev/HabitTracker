import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/contexts/ToastContext';
import { useEffect } from 'react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => dismiss(toast.id), 4000),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, dismiss]);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast
          key={id}
          data-variant={variant || 'default'}
          className="toast-base"
          {...props}
        >
          <div className="grid gap-1">
            {title && <ToastTitle className="toast-title font-bold text-base">{title}</ToastTitle>}
            {description && (
              <ToastDescription className="text-white/90 text-sm">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose onClick={() => dismiss(id)} className="toast-close" />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
