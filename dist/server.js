"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./utils/errorHandler"));
const apiKey_1 = __importDefault(require("./middleware/apiKey"));
const tdrRoutes_1 = __importDefault(require("./routes/tdrRoutes"));
const tdrValidationRoutes_1 = __importDefault(require("./routes/tdrValidationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authService_1 = __importDefault(require("./services/authService"));
const frontendAuthRoutes_1 = __importDefault(require("./routes/frontendAuthRoutes"));
const agencyRoutes_1 = __importDefault(require("./routes/agencyRoutes"));
dotenv_1.default.config();
// Keep auth endpoints publicly accessible (no x-api-key required).
app_1.default.post('/api/auth/register', async (req, res) => {
    try {
        const { userId, email, password, role } = req.body ?? {};
        if (!userId || !email || !password) {
            return res.status(400).json({ error: 'userId, email and password are required' });
        }
        const registered = await authService_1.default.register(userId, email, password, role);
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
    }
    catch (error) {
        console.error('Registration error:', error instanceof Error ? error.message : error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
app_1.default.post('/api/auth/login', async (req, res) => {
    try {
        const { userId, email, password } = req.body ?? {};
        if ((!userId && !email) || !password) {
            return res.status(400).json({ error: 'Provide userId or email, and password' });
        }
        const result = await authService_1.default.login({ userId, email }, password);
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
    }
    catch (error) {
        console.error('Login error:', error instanceof Error ? error.message : error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
app_1.default.use('/api/tdr', apiKey_1.default, tdrRoutes_1.default);
app_1.default.use('/api/tdr', apiKey_1.default, tdrValidationRoutes_1.default);
app_1.default.use('/api/admin', adminRoutes_1.default);
app_1.default.use('/api/auth', authRoutes_1.default);
app_1.default.use('/api/frontend-auth', frontendAuthRoutes_1.default);
app_1.default.use('/api/User', apiKey_1.default, userRoutes_1.default);
app_1.default.use('/api/Agency', apiKey_1.default, agencyRoutes_1.default);
app_1.default.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});
app_1.default.use(errorHandler_1.default);
app_1.default.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
const PORT = Number(process.env.PORT) || 3000;
const startServer = async () => {
    try {
        console.log('MONGO URI =>', process.env.MONGO_URI);
        await (0, db_1.default)();
        console.log('✅ Database connected');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 TDR Backend running on port ${PORT}`);
            console.log(`📊 Health: http://localhost:${PORT}/health`);
            console.log(`🆕 Create TDR: POST http://localhost:${PORT}/api/tdr/create`);
            console.log(`⚙️  Admin: http://localhost:${PORT}/api/admin/api-keys (x-api-key required)`);
            console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/register`);
        });
    }
    catch (error) {
        console.error('❌ Server startup failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
};
void startServer();
//# sourceMappingURL=server.js.map