"use client";
import React from "react";
import LoginFormDemo from "@/components/login-form-demo";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900">
      <div className="w-full max-w-md">
        <LoginFormDemo />
      </div>
    </div>
  );
}