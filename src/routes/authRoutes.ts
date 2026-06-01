import { Router, type Request, type Response } from 'express';
import AuthService from '../services/authService';

const router = Router();

async function handleRegister(req: Request, res: Response) {
  try {
    const { userId, email, password, role } = req.body;
    if (!userId || !email || !password) {
      return res.status(400).json({ error: 'userId, email and password are required' });
    }

    const registered = await AuthService.register(userId, email, password, role);
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
    console.error('Registration error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogin(req: Request, res: Response) {
  try {
    const { userId, email, password } = req.body;

    if ((!userId && !email) || !password) {
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
    console.error('Login error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

router.post('/register', handleRegister);
router.post('/signup', handleRegister);
router.post('/login', handleLogin);
router.post('/signin', handleLogin);

export default router;
