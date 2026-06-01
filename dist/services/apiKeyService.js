"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const ApiKeyAgency_1 = __importDefault(require("../models/ApiKeyAgency"));
class ApiKeyService {
    static async validateApiKey(apiKey) {
        const activeRecords = await ApiKeyAgency_1.default.find({ status: 'active' });
        for (const record of activeRecords) {
            const expiresAt = record?.metadata?.expires_at
                ? new Date(record.metadata.expires_at)
                : null;
            if (expiresAt && expiresAt.getTime() <= Date.now()) {
                continue;
            }
            const isValid = await bcryptjs_1.default.compare(apiKey, record.hashed_key);
            if (isValid) {
                record.usage_count += 1;
                record.last_used = new Date();
                await record.save();
                return {
                    agency: record.agency,
                    status: record.status,
                    keyId: record._id,
                    usage_count: record.usage_count
                };
            }
        }
        return null;
    }
    static async createApiKey({ agency, description, createdBy }) {
        const plaintextKey = crypto_1.default.randomBytes(24).toString('base64url');
        const hashedKey = await bcryptjs_1.default.hash(plaintextKey, 12);
        const doc = await ApiKeyAgency_1.default.create({
            hashed_key: hashedKey,
            agency,
            metadata: {
                description,
                created_by: createdBy
            }
        });
        return { key: plaintextKey, id: doc._id };
    }
    static async listApiKeys() {
        return ApiKeyAgency_1.default.find({}, 'agency status usage_count last_used createdAt');
    }
    static async deactivateKey(keyId) {
        return ApiKeyAgency_1.default.findByIdAndUpdate(keyId, { status: 'inactive' }, { new: true });
    }
}
exports.default = ApiKeyService;
//# sourceMappingURL=apiKeyService.js.map