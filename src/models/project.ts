import { model, Schema, Document } from 'mongoose';

interface IProject extends Document {
  name: string, // project information
  subscriber: string, // discord name
  // discordId: string, 
  serverId: string,
  whitelistRoleIDs: string[],
  subscribeStatus: number, // 1: subscribed 0: not subscribed
  walletSubmission: boolean,
  description: string,
  status: number, // 0: upcoming 1: minted
  mintDate: string,
  totalSupply: number,
  mintPrice: number,
  billingCycle: number, // 0: monthly 1: yearly
  mintAddress: string,
  wlManagement: boolean,
  daoHub: boolean,
  hashlist: string,
  creatorAddress: any,
  bearerToken: string,
  image: string,
  twitter: string,
  discord: string,
  website: string,
  keyValue: string,
  upvote: string[],
  receiverAddress: string,
  tokenAddress: string,
  tokenAmount: number,
  tokenSymbol: string,
  whitelists: any[], // discordId, roleId
  whitelistActive: number // 1: active  0: closed
}

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  subscriber: {
    type: String,
    required: true
  },
  serverId: {
    type: String,
    required: true
  },
  whitelistRoleIDs: {
    type: Array,
    required: false
  },
  subscribeStatus: {
    type: Number,
    required: false
  },
  walletSubmission: {
    type: Boolean,
    required: false
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type: Number,
    required: true
  },
  mintDate: {
    type: String,
    required: false
  },
  totalSupply: {
    type: Number,
    required: false
  },
  mintPrice: {
    type: Number,
    required: false
  },
  billingCycle: {
    type: Number,
    required: false
  },
  mintAddress: {
    type: String,
    required: false
  },
  wlManagement: {
    type: Boolean,
    required: false
  },
  daoHub: {
    type: Boolean,
    required: false
  },
  hashlist: {
    type: String,
    required: false
  },
  creatorAddress: {
    type: Array,
    required: true
  },
  bearToken: {
    type: String,
    required: false
  },
  image: {
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
  keyValue: {
    type: String,
    required: true
  },
  upvote: {
    type: Array,
    required: false
  },
  receiverAddress: {
    type: String,
    required: false
  },
  tokenAddress: {
    type: String,
    required: false
  },
  tokenAmount: {
    type: String,
    required: false
  },
  tokenSymbol: {
    type: String,
    required: false
  },
  whitelists: {
    type: Object,
    required: false
  },
  whitelistActive: {
    type: Number,
    required: false
  }
})

const Project = model<IProject>('Project', ProjectSchema);

export { Project, IProject }