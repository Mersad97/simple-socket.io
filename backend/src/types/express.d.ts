// src/types/express.d.ts
declare namespace Express {
  interface Request {
    user?: Partial<User> | null;
    validated?: {
      query?: unknown;
      params?: unknown;
      body?: unknown;
    };
  }

  interface Response {
    success: (message?: string, body?: any, status?: number) => Response;
    fail: (message?: string, status?: number, body?: any) => Response;
  }
}
