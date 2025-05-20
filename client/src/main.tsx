import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";

// A very simple app while we fix the setup issues
const SimpleApp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">HabitMaster</h1>
        <p className="text-gray-600 mb-4">
          Your personal habit tracking application. Track your daily routines
          and build better habits.
        </p>
        <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded">
          <p>We're currently setting up the application.</p>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SimpleApp />
  </QueryClientProvider>
);