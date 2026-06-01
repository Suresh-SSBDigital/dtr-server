import mongoose, { Document } from 'mongoose';
export interface ApiKeyAgencyDocument extends Document {
    hashed_key: string;
    agency: 'TDR' | 'SAMPADA' | 'SAMAGRA' | 'INTERNAL' | 'OTHER';
    status: 'active' | 'inactive';
    usage_count: number;
    last_used?: Date;
    metadata?: {
        created_by?: string;
        description?: string;
    };
}
declare const _default: mongoose.Model<ApiKeyAgencyDocument, {}, {}, {}, mongoose.Document<unknown, {}, ApiKeyAgencyDocument, {}, mongoose.DefaultSchemaOptions> & ApiKeyAgencyDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ApiKeyAgencyDocument>;
export default _default;
//# sourceMappingURL=ApiKeyAgency.d.ts.map