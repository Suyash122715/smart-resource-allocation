import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  taskId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'admin' | 'volunteer';
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Need', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['admin', 'volunteer'], required: true },
  content: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
