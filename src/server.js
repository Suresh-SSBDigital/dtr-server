import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import errorHandler from './utils/errorHandler';
import apiKeyMiddleware from './middleware/apiKey';
import tdrRoutes from './routes/tdrRoutes';
import tdrValidationRoutes from './routes/tdrValidationRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import AuthService from './services/authService';
import frontendAuthRoutes from './routes/frontendAuthRoutes';
import agencyRoutes from './routes/agencyRoutes';

dotenv.config();

// Keep auth endpoints publicly accessible (no x-api-key required).
app.post('/api/auth/register', async (req, res) => {
  try {
    const { userId, email, password, role } = req.body ?? {};
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
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, email, password } = req.body ?? {};
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
});

app.use('/api/tdr', apiKeyMiddleware, tdrRoutes);
app.use('/api/tdr', apiKeyMiddleware, tdrValidationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/frontend-auth', frontendAuthRoutes);
app.use('/api/User', apiKeyMiddleware, userRoutes);
app.use('/api/Agency', apiKeyMiddleware, agencyRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});
app.use(errorHandler);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    console.log('MONGO URI =>', process.env.MONGO_URI);
    await connectDB();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 TDR Backend running on port ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🆕 Create TDR: POST http://localhost:${PORT}/api/tdr/create`);
      console.log(`⚙️  Admin: http://localhost:${PORT}/api/admin/api-keys (x-api-key required)`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/register`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

void startServer();
