import { Router, type Request, type Response } from 'express';
import AuthService from '../services/authService';

const router = Router();

function createUserIdFromEmail(email: string): string {
  const base = email.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'user';
  return `${base}-${Date.now()}`;
}

async function handleRegister(req: Request, res: Response) {
  try {
    const { name, userId, email, password, role } = req.body as {
      name?: string;
      userId?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const resolvedUserId = userId?.trim() || (name?.trim() ? `${name.trim().replace(/\s+/g, '-').toLowerCase()}-${Date.now()}` : createUserIdFromEmail(email));
    const registered = await AuthService.register(resolvedUserId, email, password, role);
    if (!registered) {
      return res.status(409).json({ error: 'UserId or email already exists' });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        userId: registered.userId,
        email: registered.email,
        role: registered.role
      }
    });
  } catch (error) {
    console.error('Frontend register error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogin(req: Request, res: Response) {
  try {
    const { email, userId, password } = req.body as {
      email?: string;
      userId?: string;
      password?: string;
    };

    if ((!email && !userId) || !password) {
      return res.status(400).json({ error: 'Provide userId or email, and password' });
    }

    const result = await AuthService.login({ userId, email }, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: result.userId,
        role: result.role,
        apiKey: result.apiKey,
        keyId: result.keyId
      }
    });
  } catch (error) {
    console.error('Frontend login error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

router.post('/register', handleRegister);
router.post('/signup', handleRegister);
router.post('/login', handleLogin);
router.post('/signin', handleLogin);

export default router;
