import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  adminUserId: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true, trim: true },
  adminUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
