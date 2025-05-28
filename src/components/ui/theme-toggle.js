import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted)
        return null;
    return (_jsxs(Button, { variant: "ghost", size: "icon", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), title: theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro", children: [theme === "dark" ? (_jsx(Sun, { className: "h-5 w-5" })) : (_jsx(Moon, { className: "h-5 w-5" })), _jsx("span", { className: "sr-only", children: theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro" })] }));
}
