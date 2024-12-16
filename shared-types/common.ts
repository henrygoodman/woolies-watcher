export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  query: string;
  page: number;
  size: number;
  total_results: number;
  total_pages: number;
  results: T[];
}
