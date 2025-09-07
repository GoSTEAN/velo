"use client";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

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
