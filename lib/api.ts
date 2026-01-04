
import { apiClient } from "./api-client";
import { StatsData } from "../types/admin";

export async function getStats(): Promise<StatsData> {
  // Leverage apiClient's centralized caching and request handling
  const response = await apiClient.request<{ stats: StatsData }>(
    "/stats",
    { method: "GET" },
    {
      ttl: 5 * 60 * 1000, // 5 minutes cache
      backgroundRefresh: true,
      cacheKey: "platform-stats"
    }
  );

  return response.stats;
}
