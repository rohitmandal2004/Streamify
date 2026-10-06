import React from 'react';
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function SSOCallback() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 animate-pulse" />
        <p className="text-white text-sm font-medium">Completing authentication...</p>
        {/* The Clerk component that handles the OAuth response and redirect */}
        <AuthenticateWithRedirectCallback 
          signInForceRedirectUrl="/home"
          signUpForceRedirectUrl="/home"
        />
      </div>
    </div>
  );
}
