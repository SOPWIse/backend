export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export interface PaginationMeta {
  items: {
    totalItems: number;
    limit: number;
    begins: number;
    ends: number;
  };
  page: {
    current: number;
    previous: number | null;
    next: number | null;
    total: number;
    size: number;
  };
}

export interface BaseResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}
