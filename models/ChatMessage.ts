import mongoose, { Schema, Document, Model } from 'mongoose'
import { IChat } from './Chat'

export interface IChatMessage extends Document {
  chatId: mongoose.Types.ObjectId | IChat
  content: string
  senderType: 'ai' | 'user'
  sessionId: string // The session ID for the specific user
  metadata?: {
    aiModel?: string
    confidence?: number
    processingTime?: number
  }
  createdAt: Date
  updatedAt: Date
}

const ChatMessageSchema: Schema<IChatMessage> = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    content: { type: String, required: true },
    senderType: {
      type: String,
      enum: ['ai', 'user'],
      required: true,
    },
    sessionId: { type: String, required: true },
    metadata: {
      aiModel: { type: String },
      confidence: { type: Number },
      processingTime: { type: Number },
    },
  },
  {
    collection: 'chatMessages',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

// Index for efficient message retrieval by chat and session
ChatMessageSchema.index({ chatId: 1, createdAt: 1 })
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 })

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)

export default ChatMessage
