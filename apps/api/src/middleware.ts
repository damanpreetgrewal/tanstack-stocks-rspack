import { Request, Response, NextFunction } from 'express'
import { auth } from './auth'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    })

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please login',
      })
    }

    req.user = session.user as {
      id: string;
      email: string;
      name?: string;
      image?: string;
    }
    req.session = session.session as {
      id: string;
      userId: string;
      expiresAt: Date;
    }
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid session',
    })
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    })

    if (session) {
      req.user = session.user as {
        id: string;
        email: string;
        name?: string;
        image?: string;
      }
      req.session = session.session as {
        id: string;
        userId: string;
        expiresAt: Date;
      }
    }
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}
