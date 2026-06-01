import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
  userId: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
}

const userSchema = new Schema<UserDocument>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<UserDocument>('User', userSchema);
