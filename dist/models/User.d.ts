import mongoose, { Document } from 'mongoose';
export interface UserDocument extends Document {
    userId: string;
    email: string;
    passwordHash: string;
    role: string;
    isActive: boolean;
}
declare const _default: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}, mongoose.DefaultSchemaOptions> & UserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, UserDocument>;
export default _default;
//# sourceMappingURL=User.d.ts.map