// src/types/index.ts

export type ApiResponse<T> = {
  success: boolean;
  body: T;
  message?: string;
};
