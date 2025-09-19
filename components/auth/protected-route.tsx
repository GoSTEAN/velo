"use client";

import { useAuth } from "@/components/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // If we have a token but loading is taking too long, proceed cautiously
    if (token && isLoading) {
      const timeout = setTimeout(() => {
        console.log('Auth check taking long, but we have a token - proceeding');
        setHasChecked(true);
      }, 3000); // Reduced to 3 seconds
      
      return () => clearTimeout(timeout);
    }

    // Normal flow: no token and not loading = redirect to auth
    if (!isLoading && !token && !user) {
      router.push("/auth");
      setHasChecked(true);
    }

    // Normal flow: we have a user = allow access
    if (!isLoading && user) {
      setHasChecked(true);
    }

  }, [user, isLoading, token, router]);

  // Show loading spinner only briefly
  if (isLoading && !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F80ED]"></div>
      </div>
    );
  }

  // Allow access if we have a token (even if user profile fetch failed)
  // OR if we have a user
  return (token || user) ? <>{children}</> : null;
}