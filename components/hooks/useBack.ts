"use client";
import { useRouter } from "next/navigation";

/**
 * Returns a function that navigates back to the previous page.
 * Falls back to a default URL if there is no history.
 *
 * @param fallbackUrl - URL to navigate to if there is no previous page
 */
export const useBack = (fallbackUrl: string = "/") => {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return goBack;
};
