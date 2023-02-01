import { model, Schema, Document } from 'mongoose'

interface IRaffles extends Document {
  raffleName: string,
  type: number, // 0: nft  1: whitelist
  projectName: string,
  image: string,
  startDate: string,
  endDate: string,
  mintDate: string,
  twitter: string,
  discord: string,
  website: string,
  // nftName: string, // type = 0 (NFT raffle)
  availability: number, // 0: holders only  1: public
  currentTickets: string[],// discordId array
  maxTicket: number,
  rafflers: any[],
  winners: string[],  //discord array
  supply: number,
  mintPrice: number,
  winnerNumber: number,
  isEnded: boolean,
}

const RafflesSchema: Schema = new Schema({
  raffleName: {
    type: String,
    required: true
  },
  type: {// 0: nft  1:
    type: Number,
    required: true
  },
  projectName: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  startDate: {
    type: String,
    required: false
  },
  endDate: {
    type: String,
    required: false
  },
  mintDate: {
    type: String,
    required: false
  },
  twitter: {
    type: String,
    required: false
  },
  discord: {
    type: String,
    required: false
  },
  website: {
    type: String,
    required: false
  },
  // nftName: {
  //   type: String,
  //   required: false
  // },
  availability: {
    type: Number,
    required: false
  },
  currentTickets: {
    type: Array,
    required: false
  },
  maxTicket: {
    type: Number,
    required: false
  },
  rafflers: {
    type: Array,
    required: false
  },
  winners: {
    type: Array,
    required: false
  },
  supply: {
    type: Number,
    required: false
  },
  mintPrice: {
    type: Number,
    required: false
  },
  winnerNumber: {
    type: Number,
    required: false
  },
  isEnded: {
    type: Boolean,
    required: false
  }
})

const Raffles = model<IRaffles>('Raffles', RafflesSchema)

export { Raffles, IRaffles }