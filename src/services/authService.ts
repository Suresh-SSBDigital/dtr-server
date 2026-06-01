import bcrypt from 'bcryptjs';
import User from '../models/User';
import ApiKeyService from './apiKeyService';

interface AuthResult {
  userId: string;
  role: string;
  apiKey: string;
  keyId: string;
}

interface RegisterResult {
  userId: string;
  email: string;
  role: string;
}

class AuthService {
  static async register(
    userId: string,
    email: string,
    password: string,
    role?: string
  ): Promise<RegisterResult | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({
      $or: [{ userId }, { email: normalizedEmail }]
    });
    if (existing) {
      return null;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
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

  static async login(identity: { userId?: string; email?: string }, password: string): Promise<AuthResult | null> {
    const orConditions: Record<string, unknown>[] = [];
    if (identity.userId) {
      orConditions.push({ userId: identity.userId });
    }
    if (identity.email) {
      orConditions.push({ email: identity.email.trim().toLowerCase() });
    }
    if (orConditions.length === 0) {
      return null;
    }

    const user = await User.findOne({ isActive: true, $or: orConditions });
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    const apiKeyResult = await ApiKeyService.createApiKey({
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

export default AuthService;
