import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
const ToastContext = React.createContext(null);
export function Toast({ children, ...props }) {
    return (_jsx("div", { role: "alert", className: "toast", ...props, children: children }));
}
export function ToastProvider({ children }) {
    return _jsx("div", { className: "toast-provider", children: children });
}
export function ToastTitle({ children }) {
    return _jsx("div", { className: "toast-title", children: children });
}
export function ToastDescription({ children }) {
    return _jsx("div", { className: "toast-description", children: children });
}
export function ToastClose() {
    return (_jsx("button", { className: "toast-close", "aria-label": "Close", children: "\u00D7" }));
}
export function ToastViewport() {
    return _jsx("div", { className: "toast-viewport" });
}
