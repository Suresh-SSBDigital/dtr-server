import mongoose, { Document, Schema } from 'mongoose';

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

const apiKeyAgencySchema = new Schema<ApiKeyAgencyDocument>({
  hashed_key: {
    type: String,
    required: true
  },
  agency: {
    type: String,
    required: true,
    enum: ['TDR', 'SAMPADA', 'SAMAGRA', 'INTERNAL', 'OTHER']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  usage_count: {
    type: Number,
    default: 0
  },
  last_used: {
    type: Date
  },
  metadata: {
    created_by: String,
    description: String
  }
}, {
  timestamps: true
});

apiKeyAgencySchema.index({ hashed_key: 1 });
apiKeyAgencySchema.index({ status: 1 });

export default mongoose.model<ApiKeyAgencyDocument>('ApiKeyAgency', apiKeyAgencySchema);
