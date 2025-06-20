/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, Document, Model } from 'mongoose'
import { IUser } from './User'
import { IProduct } from './Product'

export interface IProductFeedback extends Document {
  productId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  upVoted: boolean
  downVoted: boolean
  used: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductFeedbackSchema: Schema<IProductFeedback> = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upVoted: {
      type: Boolean,
      default: false,
    },
    downVoted: {
      type: Boolean,
      default: false,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'productFeedback',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

// Create compound index to ensure one feedback per user per product
ProductFeedbackSchema.index({ productId: 1, userId: 1 }, { unique: true })

const ProductFeedback: Model<IProductFeedback> =
  mongoose.models.ProductFeedback ||
  mongoose.model<IProductFeedback>('ProductFeedback', ProductFeedbackSchema)

export default ProductFeedback
