/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, Document, Model } from 'mongoose'
import { IUser } from './User'

export interface IProduct extends Document {
  name: string
  country: string
  category: string[]
  description: string
  website: string
  logo?: string
  active?: boolean
  featured?: boolean
  submittedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'products',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
