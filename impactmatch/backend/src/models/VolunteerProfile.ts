import mongoose, { Document, Schema } from 'mongoose';

export interface IVolunteerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  skills: string[];
  availability: string[];
  location: string;
  socialCredits: number;
  active: boolean;
  bio?: string;
}

const VolunteerProfileSchema = new Schema<IVolunteerProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [{ type: String, trim: true }],
  availability: [{ type: String }],
  location: { type: String, default: '', trim: true },
  socialCredits: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  bio: { type: String, trim: true },
}, { timestamps: true });

export const getBadge = (credits: number): { label: string; emoji: string } => {
  if (credits >= 2100) return { label: 'Legend', emoji: '🏆' };
  if (credits >= 900) return { label: 'Champion', emoji: '⭐' };
  if (credits >= 300) return { label: 'Contributor', emoji: '🌿' };
  return { label: 'Seedling', emoji: '🌱' };
};

export default mongoose.model<IVolunteerProfile>('VolunteerProfile', VolunteerProfileSchema);
