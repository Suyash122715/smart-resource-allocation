import mongoose, { Document, Schema } from 'mongoose';

export interface INeed extends Document {
  orgId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  schedule: string;
  scheduleDays: string[];
  status: 'open' | 'assigned' | 'fulfilled';
  createdAt: Date;
}

const NeedSchema = new Schema<INeed>({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  skillsRequired: [{ type: String, trim: true }],
  urgency: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  location: { type: String, required: true, trim: true },
  schedule: { type: String, default: '' },
  scheduleDays: [{ type: String }],
  status: { type: String, enum: ['open', 'assigned', 'fulfilled'], default: 'open' },
}, { timestamps: true });

export default mongoose.model<INeed>('Need', NeedSchema);
