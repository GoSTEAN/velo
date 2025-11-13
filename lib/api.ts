import { StatsData } from "../types/admin";
import { tokenManager } from "@/components/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getStats(): Promise<StatsData> {
  const token = tokenManager.getToken();
  const response = await fetch(
    `${API_BASE_URL}/stats`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }

  const data = await response.json();
  console.log("Data",data)
  return data.stats;
}
