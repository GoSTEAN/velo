"use client";
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid SSR/client hydration mismatch by rendering nothing until mounted.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button onClick={toggleTheme}>
      {theme === "dark" ? (
        <Sun className="text-foreground" />
      ) : (
        <Moon  className="text-head"/>
      )}

      {/* <span className="sr-only">Toggle theme</span> */}
    </button>
  );
}
