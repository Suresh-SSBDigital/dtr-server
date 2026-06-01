import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Types } from 'mongoose';
import ApiKeyAgency from '../models/ApiKeyAgency';

type ApiAgencyType = 'TDR' | 'SAMPADA' | 'SAMAGRA' | 'INTERNAL' | 'OTHER';

interface CreateApiKeyPayload {
  agency: ApiAgencyType;
  description?: string;
  createdBy?: string;
}

interface ApiKeyValidationResult {
  agency: ApiAgencyType;
  status: string;
  keyId: Types.ObjectId;
  usage_count: number;
}

class ApiKeyService {
  static async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult | null> {
    const activeRecords = await ApiKeyAgency.find({ status: 'active' });

    for (const record of activeRecords) {
      const expiresAt = (record as any)?.metadata?.expires_at
        ? new Date((record as any).metadata.expires_at)
        : null;
      if (expiresAt && expiresAt.getTime() <= Date.now()) {
        continue;
      }

      const isValid = await bcrypt.compare(apiKey, record.hashed_key);
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

  static async createApiKey({ agency, description, createdBy }: CreateApiKeyPayload) {
    const plaintextKey = crypto.randomBytes(24).toString('base64url');
    const hashedKey = await bcrypt.hash(plaintextKey, 12);
    const doc = await ApiKeyAgency.create({
      hashed_key: hashedKey,
      agency,
      metadata: {
        description,
        created_by: createdBy
      }
    }) as any;

    return { key: plaintextKey, id: doc._id };
  }

  static async listApiKeys() {
    return ApiKeyAgency.find({}, 'agency status usage_count last_used createdAt');
  }

  static async deactivateKey(keyId: string) {
    return ApiKeyAgency.findByIdAndUpdate(keyId, { status: 'inactive' }, { new: true });
  }
}

export default ApiKeyService;
