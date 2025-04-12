import mongoose, { Schema, Document, Model } from 'mongoose'
import { IProduct } from './Product'

export interface IFeaturedProduct extends Document {
  productId: mongoose.Types.ObjectId | IProduct
  status: boolean
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

const FeaturedProductSchema: Schema<IFeaturedProduct> = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
  },
  {
    collection: 'featuredProducts',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

// Index for efficient featured product retrieval
FeaturedProductSchema.index({ productId: 1, status: 1 })
FeaturedProductSchema.index({ startDate: 1, endDate: 1 })

const FeaturedProduct: Model<IFeaturedProduct> =
  mongoose.models.FeaturedProduct ||
  mongoose.model<IFeaturedProduct>('FeaturedProduct', FeaturedProductSchema)

export default FeaturedProduct
