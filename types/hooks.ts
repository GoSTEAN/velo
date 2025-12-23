export interface QueryResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export interface PaginatedQueryResult<T> extends QueryResult<T> {
  hasMore: boolean;
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
}