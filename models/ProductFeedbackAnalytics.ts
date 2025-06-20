/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, Document, Model } from 'mongoose'
import { IProduct } from './Product'

export interface IProductFeedbackAnalytics extends Document {
  productId: mongoose.Types.ObjectId
  upVote: number
  downVote: number
  inUse: number
  createdAt: Date
  updatedAt: Date
}

const ProductFeedbackAnalyticsSchema: Schema<IProductFeedbackAnalytics> =
  new Schema(
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true,
      },
      upVote: {
        type: Number,
        default: 0,
      },
      downVote: {
        type: Number,
        default: 0,
      },
      inUse: {
        type: Number,
        default: 0,
      },
    },
    {
      collection: 'productFeedbackAnalytics',
      timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    }
  )

const ProductFeedbackAnalytics: Model<IProductFeedbackAnalytics> =
  mongoose.models.ProductFeedbackAnalytics ||
  mongoose.model<IProductFeedbackAnalytics>(
    'ProductFeedbackAnalytics',
    ProductFeedbackAnalyticsSchema
  )

export default ProductFeedbackAnalytics
