// src/middlewares/validate.ts
import type { Request, Response, NextFunction } from "express";
import z, { ZodError, ZodType } from "zod";

type ValidateOptions = {
  body?: ZodType<any, any, any>;
  query?: ZodType<any, any, any>;
  params?: ZodType<any, any, any>;
};

export function validate(opts: ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated: { body?: any; query?: any; params?: any } = {};

      // body
      if (opts.body) {
        // console.log("req.body", req.body);
        const result = opts.body.safeParse(req.body);
        if (!result.success) {
          // می‌توانی از z.treeifyError هم استفاده کنی برای ساختار درختی
          const tree = z.treeifyError(result.error);
          return res.status(400).json({
            success: false,
            message: "Validation failed (body)",
            errors: tree,
          });
        }
        validated.body = result.data;
      }

      // query
      if (opts.query) {
        const result = opts.query.safeParse(req.query);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          return res.status(400).json({
            success: false,
            message: "Validation failed (query)",
            errors: tree,
          });
        }
        validated.query = result.data;
      }

      // params
      if (opts.params) {
        const result = opts.params.safeParse(req.params);
        if (!result.success) {
          const tree = z.treeifyError(result.error);
          return res.status(400).json({
            success: false,
            message: "Validation failed (params)",
            errors: tree,
          });
        }
        validated.params = result.data;
      }

      // attach validated object instead of mutating req.query/req.params
      req.validated = { ...(req.validated ?? {}), ...validated };

      return next();
    } catch (err) {
      console.error("validate middleware unexpected error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal validation error",
        errors: [{ field: "server", message: "خطای سرور" }],
      });
    }
  };
}

export function CreateValidate() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated: { body?: any; query?: any; params?: any } = {
        body: {},
        query: {},
        params: {},
      };
      // attach validated object instead of mutating req.query/req.params
      req.validated = { ...(req.validated ?? {}), ...validated };
      return next();
    } catch (err) {
      console.error("validate middleware unexpected error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal validation error",
        errors: [{ field: "server", message: "خطای سرور" }],
      });
    }
  };
}
