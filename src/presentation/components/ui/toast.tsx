import * as React from "react"

const ToastContext = React.createContext<any>(null)

export function Toast({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div role="alert" className="toast" {...props}>
      {children}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <div className="toast-provider">{children}</div>
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <div className="toast-title">{children}</div>
}

export function ToastDescription({ children }: { children: React.ReactNode }) {
  return <div className="toast-description">{children}</div>
}

export function ToastClose() {
  return (
    <button className="toast-close" aria-label="Close">
      &times;
    </button>
  )
}

export function ToastViewport() {
  return <div className="toast-viewport" />
}