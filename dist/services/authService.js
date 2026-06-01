"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const apiKeyService_1 = __importDefault(require("./apiKeyService"));
class AuthService {
    static async register(userId, email, password, role) {
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User_1.default.findOne({
            $or: [{ userId }, { email: normalizedEmail }]
        });
        if (existing) {
            return null;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const newUser = await User_1.default.create({
            userId,
            email: normalizedEmail,
            passwordHash,
            role: role === 'admin' ? 'admin' : 'user'
        });
        return {
            userId: newUser.userId,
            email: newUser.email,
            role: newUser.role
        };
    }
    static async login(identity, password) {
        const orConditions = [];
        if (identity.userId) {
            orConditions.push({ userId: identity.userId });
        }
        if (identity.email) {
            orConditions.push({ email: identity.email.trim().toLowerCase() });
        }
        if (orConditions.length === 0) {
            return null;
        }
        const user = await User_1.default.findOne({ isActive: true, $or: orConditions });
        if (!user) {
            return null;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return null;
        }
        const apiKeyResult = await apiKeyService_1.default.createApiKey({
            agency: 'TDR',
            description: `API key for user ${user.userId}`,
            createdBy: `${user.userId}|${user.email}`
        });
        return {
            userId: user.userId,
            role: user.role,
            apiKey: apiKeyResult.key,
            keyId: apiKeyResult.id.toString()
        };
    }
}
exports.default = AuthService;
//# sourceMappingURL=authService.js.map