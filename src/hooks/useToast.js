let toasts = [];
export function useToast() {
    return {
        toasts: toasts,
        toast: (props) => {
            const id = Math.random().toString(36).substring(2, 9);
            const newToast = { id, ...props };
            toasts = [...toasts, newToast];
            return {
                id,
                dismiss: () => {
                    toasts = toasts.filter(t => t.id !== id);
                },
                update: (props) => {
                    toasts = toasts.map(t => t.id === id ? { ...t, ...props } : t);
                }
            };
        },
        dismiss: (toastId) => {
            if (toastId) {
                toasts = toasts.filter(t => t.id !== toastId);
            }
            else {
                toasts = [];
            }
        }
    };
}
