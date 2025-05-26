import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">HabitMaster</h1>
        <p className="text-gray-600 mb-4">
          Your personal habit tracking application. Track your daily routines
          and build better habits.
        </p>
        <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded">
          <p>We're currently setting up the application. Please check back soon!</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;