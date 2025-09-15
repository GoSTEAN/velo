import { useAuth } from "@/components/context/AuthContext";
import React from "react";

export default function Logout() {
  const { logout } = useAuth();
  return (
    <div className="w-full bg-background flex items-center justify-center h-full">
      <div className="w-full max-w-sm p-6 bg-card border border-border rounded-lg flex flex-col items-center justify-center gap-4">
        <h2 className="text-foreground text-custom-xl font-semibold">
          Are you sure you want to logout?
        </h2>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
