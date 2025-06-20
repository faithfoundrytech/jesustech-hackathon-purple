import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOpportunity extends Document {
  name: string
  email: string
  country: string
  ministry?: string
  categories: string[]
  description: string
  createdBy?: mongoose.Types.ObjectId
  active?: boolean
  sponsored?: boolean
  createdAt: Date
  updatedAt: Date
  type: 'problem' | 'job'
}

const OpportunitySchema: Schema<IOpportunity> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    ministry: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    active: {
      type: Boolean,
      default: false,
    },
    sponsored: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['problem', 'job'],
      required: true,
    },
  },
  {
    collection: 'opportunities',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunity>('Opportunity', OpportunitySchema)

export default Opportunity
