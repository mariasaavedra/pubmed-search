import { Request, Response, NextFunction } from "express";
/**
 * Express middleware for logging HTTP requests and responses
 */
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
