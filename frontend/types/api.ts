export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}
