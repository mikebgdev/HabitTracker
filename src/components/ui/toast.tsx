import * as React from 'react';

export function Toast({ children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div role="alert" className="toast" {...props}>
      {children}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <div className="toast-provider">{children}</div>;
}

export function ToastTitle({
  children,
  className = '',
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`toast-title ${className}`}>{children}</div>;
}

export function ToastDescription({
  children,
  className = '',
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`toast-description ${className}`}>{children}</div>;
}

export function ToastClose(props: React.ComponentProps<'button'>) {
  return (
    <button className="toast-close" aria-label="Close" {...props}>
      &times;
    </button>
  );
}

export function ToastViewport() {
  return <div className="toast-viewport" />;
}
