import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";

/**
 * Generate a unique request ID
 * @returns A unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Clean request body for logging - removes sensitive data
 * @param body Request body
 * @returns Cleaned body object
 */
function cleanRequestBody(body: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!body) return undefined;

  const cleanedBody = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "api_key", "apiKey", "secret"];
  sensitiveFields.forEach((field) => {
    if (cleanedBody[field]) {
      cleanedBody[field] = "[REDACTED]";
    }
  });

  return cleanedBody;
}

/**
 * Express middleware for logging HTTP requests and responses
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Add request ID and start time
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Store request ID in response locals
  res.locals.requestId = requestId;

  // Log the incoming request
  Logger.http(req.method, req.url, undefined, undefined);

  // Log detailed request info
  Logger.debug("Request", `${req.method} ${req.url}`, {
    requestId: res.locals.requestId,
    body: req.method !== "GET" ? cleanRequestBody(req.body) : undefined,
    query: Object.keys(req.query).length ? req.query : undefined,
    params: Object.keys(req.params).length ? req.params : undefined,
    headers: {
      "user-agent": req.headers["user-agent"],
      "content-type": req.headers["content-type"],
      accept: req.headers["accept"],
    },
  });

  // Store original methods
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);

  // Override res.send
  res.send = function (body: unknown): Response {
    const duration = Date.now() - startTime;

    // Log response info
    Logger.http(req.method, req.url, res.statusCode, duration);

    // For errors, provide more detail
    if (res.statusCode >= 400) {
      Logger.warn(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else if (res.statusCode >= 500) {
      Logger.error(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else {
      Logger.debug(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
        }
      );
    }

    return originalSend.call(this, body);
  };

  // Override res.json
  res.json = function (body: unknown): Response {
    const duration = Date.now() - startTime;

    // Log response info
    Logger.http(req.method, req.url, res.statusCode, duration);

    // For errors, provide more detail
    if (res.statusCode >= 400 && res.statusCode < 500) {
      Logger.warn(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else if (res.statusCode >= 500) {
      Logger.error(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else {
      Logger.debug(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
        }
      );
    }

    return originalJson.call(this, body);
  };

  // Continue to the next middleware
  next();
}
