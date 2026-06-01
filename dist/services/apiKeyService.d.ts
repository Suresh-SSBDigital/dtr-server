import { Types } from 'mongoose';
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
declare class ApiKeyService {
    static validateApiKey(apiKey: string): Promise<ApiKeyValidationResult | null>;
    static createApiKey({ agency, description, createdBy }: CreateApiKeyPayload): Promise<{
        key: string;
        id: any;
    }>;
    static listApiKeys(): Promise<(import("mongoose").Document<unknown, {}, import("../models/ApiKeyAgency").ApiKeyAgencyDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/ApiKeyAgency").ApiKeyAgencyDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    static deactivateKey(keyId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/ApiKeyAgency").ApiKeyAgencyDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/ApiKeyAgency").ApiKeyAgencyDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
export default ApiKeyService;
//# sourceMappingURL=apiKeyService.d.ts.map