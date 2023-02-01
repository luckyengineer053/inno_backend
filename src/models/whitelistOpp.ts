import { model, Schema, Document } from 'mongoose';

interface IWhitelistOpp extends Document {
  projectName: string,
  hostedProject: string,
  whitelistSpots: number,
  requirement: number, // 0: twitter  1: discord  2: website
  description: string,
  startDate: string,
  endDate: string,
  image: string,
  twitter: string,
  discord: string,
  website: string
}

const whitelistOppSchema: Schema = new Schema({
  projectName: {
    type: String,
    required: true,
  },
  hostedProject: {
    type: String,
    required: true,
  },
  whitelistSpots: {
    type: Number,
    required: true
  },
  requirement: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: false
  },
  endDate: {
    type: String,
    required: false
  },
  image: {
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
  }
})

const Project = model<IWhitelistOpp>('Project', whitelistOppSchema);

export { Project, IWhitelistOpp }