

import { model, Schema, Document } from 'mongoose';

interface INFT extends Document {
  id: number,
  uri: string,
  imageUrl: string,
  state: number
}
const NFTSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  uri: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  prevUri: {
    type: String,
    default: '',
  },
  prevImageUrl: {
    type: String,
    default: '',
  },
  state: {
    type: Number,
    default: 0,
    required: false
  }
})

const NFT = model<INFT>('wobblebug_trait', NFTSchema);

export { NFT, INFT }