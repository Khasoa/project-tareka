export type UserRole = "recycler" | "operator" | "company_admin" | "platform_admin";

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}
