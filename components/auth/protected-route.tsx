"use client";

import { useAuth } from "@/components/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If still loading auth state, wait
    if (isLoading) {
      return;
    }

    // Check if user is authenticated
    const isAuthenticated = !!(token || user);
    
    if (isAuthenticated) {
      setIsChecking(false);
    } else {
      // Only redirect if we're not already on the auth page
      if (!pathname.includes('/auth')) {
        console.log('Not authenticated - redirecting to auth');
        // Use replace: false to allow back button to work properly
        router.push("/auth");
      }
      setIsChecking(false);
    }
  }, [user, isLoading, token, router, pathname]);

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F80ED]"></div>
      </div>
    );
  }

  // Only render children if authenticated
  if (token || user) {
    return <>{children}</>;
  }

  // Return null if not authenticated (will redirect)
  return null;
}