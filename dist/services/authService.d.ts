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
declare class AuthService {
    static register(userId: string, email: string, password: string, role?: string): Promise<RegisterResult | null>;
    static login(identity: {
        userId?: string;
        email?: string;
    }, password: string): Promise<AuthResult | null>;
}
export default AuthService;
//# sourceMappingURL=authService.d.ts.map