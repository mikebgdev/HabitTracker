import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
const ProgressBar = React.forwardRef(({ className, value, variant = "default", ...props }, ref) => {
    const getVariantClass = () => {
        switch (variant) {
            case "success":
                return "bg-green-500";
            case "warning":
                return "bg-amber-500";
            case "danger":
                return "bg-red-500";
            default:
                return "bg-primary";
        }
    };
    const getVariantBasedOnValue = () => {
        if (value >= 80)
            return "bg-green-500";
        if (value >= 50)
            return "bg-amber-500";
        return "bg-red-500";
    };
    return (_jsx(ProgressPrimitive.Root, { ref: ref, className: cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", className), ...props, children: _jsx(ProgressPrimitive.Indicator, { className: cn("h-full w-full flex-1 transition-all", variant === "default" ? getVariantBasedOnValue() : getVariantClass()), style: { transform: `translateX(-${100 - (value || 0)}%)` } }) }));
});
ProgressBar.displayName = ProgressPrimitive.Root.displayName;
export { ProgressBar };
