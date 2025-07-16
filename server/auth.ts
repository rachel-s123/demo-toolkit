import { Request, Response, NextFunction } from 'express';

// Simple placeholder auth middleware - no authentication required
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Skip authentication for now
  next();
}
