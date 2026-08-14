import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { Context } from "hono";

interface HTTPExceptionCause {
  code?: string;
  fieldErrors?: Record<string, string[]>;
  details?: unknown;
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    const cause = err.cause as HTTPExceptionCause | undefined;
    return c.json(
      {
        error: {
          code: cause?.code || err.message,
          message: err.message,
          fieldErrors: cause?.fieldErrors,
          details: cause?.details,
        },
      },
      err.status
    );
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return c.json(
      {
        error: {
          code: "validation_error",
          message: "Validation failed",
          fieldErrors,
        },
      },
      400
    );
  }

  console.error("Unhandled error:", err);
  return c.json(
    {
      error: {
        code: "internal_error",
        message: "An internal error occurred",
      },
    },
    500
  );
}

export function notFoundHandler(c: Context) {
  return c.json(
    {
      error: {
        code: "not_found",
        message: "Resource not found",
      },
    },
    404
  );
}