import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  status: 'active' | 'inactive' | 'suspended'
  clerkId?: string
  image?: string
  createdAt: Date
  updatedAt: Date
  unlimited?: boolean
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    image: {
      type: String,
      trim: true,
    },
    unlimited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
)

// Create indexes for better query performance
UserSchema.index({ email: 1 })
// Note: clerkId index is already created by unique: true, so we don't need to create it manually

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
