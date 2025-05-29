import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProgressBar } from '@/components/ui/progress-bar';
import { motion } from 'framer-motion';
export function ProgressOverview({ routines, streak = 0, totalGroups = 0, completedGroups = 0, }) {
    const totalRoutines = routines.length;
    const completedRoutines = routines.filter((r) => r.completedAt).length;
    const completionRate = totalRoutines > 0
        ? Math.round((completedRoutines / totalRoutines) * 100)
        : 0;
    const highPriorityRoutines = routines.filter((r) => r.priority === 'high');
    const completedHighPriority = highPriorityRoutines.filter((r) => r.completedAt).length;
    const getProgressVariant = (percent) => {
        if (percent >= 80)
            return 'success';
        if (percent >= 50)
            return 'warning';
        return 'danger';
    };
    const variantColor = getProgressVariant(completionRate);
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Daily Progress" }), _jsxs("div", { className: "mt-2 md:mt-0 text-sm font-medium", children: [_jsx("span", { className: "text-gray-700 dark:text-gray-300", children: "Completed:" }), _jsxs("span", { className: "text-green-600 dark:text-green-400 ml-1", children: [completedRoutines, "/", totalRoutines, " routines"] })] })] }), _jsx(motion.div, { initial: { width: '0%' }, animate: { width: `${completionRate}%` }, transition: { duration: 0.5, ease: 'easeOut' }, children: _jsx(ProgressBar, { value: completionRate, className: "w-full h-4 mb-4", variant: variantColor }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3", children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm", children: "Completion Rate" }), _jsxs("p", { className: `text-2xl font-bold ${variantColor === 'success'
                                    ? 'text-green-500'
                                    : variantColor === 'warning'
                                        ? 'text-amber-500'
                                        : 'text-red-500'}`, children: [completionRate, "%"] })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3", children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm", children: "Streak" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: [streak, " days"] })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3", children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm", children: "Groups" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: [completedGroups, "/", totalGroups] })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3", children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm", children: "High Priority" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: [completedHighPriority, "/", highPriorityRoutines.length] })] })] })] }));
}
