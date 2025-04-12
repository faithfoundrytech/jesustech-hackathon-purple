import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChat extends Document {
  name: string // AI-generated summary name
  sessionId: string // The session ID for the specific user
  status: 'active' | 'archived' | 'deleted'
  lastMessageAt: Date
  messageCount: number
  summary?: string // AI-generated summary of the conversation
  createdAt: Date
  updatedAt: Date
}

const ChatSchema: Schema<IChat> = new Schema(
  {
    name: { type: String, required: true },
    sessionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
    summary: { type: String },
  },
  {
    collection: 'chats',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

// Index for efficient chat retrieval by session
ChatSchema.index({ sessionId: 1, createdAt: 1 })

const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema)

export default Chat
