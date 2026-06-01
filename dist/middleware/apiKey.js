"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiKeyService_1 = __importDefault(require("../services/apiKeyService"));
const unauthorized = (res) => {
    res.status(401).json({
        success: false,
        message: 'Invalid or missing API key'
    });
};
const apiKeyMiddleware = async (req, res, next) => {
    // Auth endpoints must remain public for register/login.
    if (req.originalUrl.startsWith('/api/auth/') || req.originalUrl.startsWith('/api/frontend-auth/')) {
        next();
        return;
    }
    const rawApiKey = req.header('x-api-key');
    const apiKey = rawApiKey?.trim();
    // Reject missing/empty/malformed key and never accept key from query params.
    if (!apiKey) {
        console.warn(`⚠️ Unauthorized API request (missing key): ${req.method} ${req.originalUrl} ip=${req.ip}`);
        unauthorized(res);
        return;
    }
    if (apiKey.length < 16 || /\\s/.test(apiKey)) {
        console.warn(`⚠️ Unauthorized API request (malformed key): ${req.method} ${req.originalUrl} ip=${req.ip}`);
        unauthorized(res);
        return;
    }
    try {
        const agencyInfo = await apiKeyService_1.default.validateApiKey(apiKey);
        if (!agencyInfo) {
            console.warn(`⚠️ Unauthorized API request (invalid/inactive/expired key): ${req.method} ${req.originalUrl} ip=${req.ip}`);
            unauthorized(res);
            return;
        }
        req.agency = {
            agency: agencyInfo.agency,
            status: agencyInfo.status,
            keyId: agencyInfo.keyId.toString(),
            usage_count: agencyInfo.usage_count
        };
        console.log(`✅ API access: ${agencyInfo.agency} (keyId: ${agencyInfo.keyId}) usage: ${agencyInfo.usage_count}`);
        next();
    }
    catch (error) {
        console.error('API key validation error:', error instanceof Error ? error.message : error);
        unauthorized(res);
    }
};
exports.default = apiKeyMiddleware;
//# sourceMappingURL=apiKey.js.map