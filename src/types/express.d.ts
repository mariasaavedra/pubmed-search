import { Request } from 'express';

// Extend Express Request interface to add custom properties
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}
