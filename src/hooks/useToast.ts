
interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

let toasts: Toast[] = [];

export function useToast() {
  return {
    toasts: toasts,
    toast: (props: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, ...props };
      toasts = [...toasts, newToast];
      return {
        id,
        dismiss: () => {
          toasts = toasts.filter(t => t.id !== id);
        },
        update: (props: Partial<Omit<Toast, "id">>) => {
          toasts = toasts.map(t => t.id === id ? { ...t, ...props } : t);
        }
      };
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        toasts = toasts.filter(t => t.id !== toastId);
      } else {
        toasts = [];
      }
    }
  };
}