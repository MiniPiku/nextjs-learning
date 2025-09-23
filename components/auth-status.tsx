"use client";
import React from "react";
import { isLoggedIn, clearAuthData } from "@/lib/getAuthHeader";

export default function AuthStatus() {
  const handleLogout = () => {
    clearAuthData();
    // Redirect to home page or login page
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center space-x-4">
      {isLoggedIn() ? (
        <>
          <span className="text-sm text-gray-700 dark:text-gray-300">Logged in</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </>
      ) : (
        <a 
          href="/login" 
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Login
        </a>
      )}
    </div>
  );
}