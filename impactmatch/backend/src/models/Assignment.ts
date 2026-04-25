import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  needId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  matchScore: number;
  status: 'confirmed' | 'completed';
  assignedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  needId: { type: Schema.Types.ObjectId, ref: 'Need', required: true },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  matchScore: { type: Number, default: 0 },
  status: { type: String, enum: ['confirmed', 'completed'], default: 'confirmed' },
  assignedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
