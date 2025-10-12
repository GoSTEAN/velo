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
    if (isLoading) return;

    const isAuthenticated = !!(token || user);

    if (isAuthenticated) {
      setIsChecking(false);
    } else {
      // Redirect logic for unauthenticated users
      if (!pathname.includes("/auth/login")) {
        console.log("Not authenticated - redirecting to login");
        router.push("/auth/login");
      }
      setIsChecking(false);
    }
  }, [user, isLoading, token, router, pathname]);

  // Show loading spinner while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F80ED]" />
      </div>
    );
  }

  // Only render children if authenticated
  if (token || user) {
    return <>{children}</>;
  }

  // Return null if not authenticated (redirect happens)
  return null;
}
