import { model, Schema, Document } from 'mongoose';

interface IWlRaffle extends Document {
  projectName: string,
  hostedProjectId: string,
  submittedUser: string,
  wlSpots: number,
  totalEntries: number,
  requirement: number,
  description: string,
  detail: string,
  supply: number,
  mintDate: string,
  mintPrice: number,
  startDate: string,
  endDate: string,
  twitter: string,
  discord: string,
  website: string,
  image: string,
  winners: any[],  // winners discord id
  rafflers: any[],
  role: string,
  roles: any[],
  isEnded: boolean, // true: decieded winners   false: not deciede
  isActive: boolean, // true: claimed tab - active   false: closed
  verifiedUsers: any[],
  roleId: string,
  serverId: string,
  timeStatus: number, // 0: not started, 1: ongoing, 2: ended
  whitelistActive: number // 0: closed  1: active
}
const WlRaffleSchema: Schema = new Schema({
  projectName: {
    type: String,
    required: true,
  },
  hostedProjectId: {
    type: String,
    required: false
  },
  wlSpots: {
    type: Number,
    required: false,
  },
  totalEntries: {
    type: Number,
    required: false
  },
  requirement: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: false,
  },
  detail: {
    type: String,
    required: false
  },
  supply: {
    type: Number,
    required: false
  },
  mintDate: {
    type: String,
    required: false
  },
  mintPrice: {
    type: Number,
    required: false
  },
  startDate: {
    type: String,
    required: false,
  },
  endDate: {
    type: String,
    required: false
  },
  twitter: {
    type: String,
    required: false,
  },
  discord: {
    type: String,
    required: false,
  },
  website: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  submittedUser: {
    type: String,
    required: false
  },
  winners: {
    type: Array,
    required: false
  },
  role: {
    type: String,
    required: false
  },
  roles: {
    type: Array,
    required: false
  },
  rafflers: {
    type: Array,
    required: false
  },
  isEnded: {
    type: Boolean,
    required: false
  },
  isActive: {
    type: Boolean,
    required: false
  },
  verifiedUsers: {
    type: Boolean,
    required: false
  },
  serverId: {
    type: String,
    required: false
  },
  roleId: {
    type: String,
    required: false
  },
  timeStatus: {
    type: Number,
    required: false
  },
  whitelistActive: {
    type: Number,
    required: false
  }
})

const WlRaffle = model<IWlRaffle>('WlRaffle', WlRaffleSchema);

export { WlRaffle, IWlRaffle }