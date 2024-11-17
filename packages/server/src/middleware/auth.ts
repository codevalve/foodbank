import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, User } from '../types';
import { supabase } from '../db';
import { AppError } from '../utils/errors';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        organization_id: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // For test environment, allow mock user from headers
    if (process.env.NODE_ENV === 'test' && req.headers.user) {
      const mockUser = JSON.parse(req.headers.user as string);
      (req as AuthenticatedRequest).user = mockUser;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('No authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    // Verify token and get user data
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid token', 401);
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new AppError('User not found', 404);
    }

    // Add user to request
    (req as AuthenticatedRequest).user = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      organization_id: userData.organization_id
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // For test environment, get mock user from header
    if (process.env.NODE_ENV === 'test') {
      const mockUser = req.headers['user'];
      if (mockUser && typeof mockUser === 'string') {
        (req as AuthenticatedRequest).user = JSON.parse(mockUser);
        return next();
      }
    }

    // For production, verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    // TODO: Implement JWT verification
    // For now, just pass through in development
    if (process.env.NODE_ENV === 'development') {
      (req as AuthenticatedRequest).user = {
        id: 'dev-user',
        email: 'dev@example.com',
        role: 'admin',
        organization_id: 'dev-org'
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      error: 'Token verification not implemented'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
