import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatUsage extends Document {
  userId: mongoose.Types.ObjectId
  year: number
  month: number // 1-12
  chatCount: number
  createdAt: Date
  updatedAt: Date
}

const ChatUsageSchema: Schema<IChatUsage> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    chatCount: { type: Number, required: true, default: 0 },
  },
  {
    collection: 'chatUsage',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

// Create compound index for efficient querying
ChatUsageSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true })

const ChatUsage: Model<IChatUsage> =
  mongoose.models.ChatUsage ||
  mongoose.model<IChatUsage>('ChatUsage', ChatUsageSchema)

export default ChatUsage
