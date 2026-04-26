import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'new_need' | 'task_fulfilled';
  title: string;
  message: string;
  needId: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['new_need', 'task_fulfilled'], required: true },
  title:   { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  needId:  { type: Schema.Types.ObjectId, ref: 'Need', required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
