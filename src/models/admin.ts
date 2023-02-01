import { model, Schema, Document } from 'mongoose';

interface IAdmin extends Document {
  username: string,
  password: string,
  discordId: string,
  discordName: string,
  avatar: string,
  role: string, // 0: admin   1: subscriber
  wlRaffle: boolean,
  daoVoting: boolean
}

const AdminSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  discordId: {
    type: String,
    required: true
  },
  discordName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
  },
  hasWlRaffle: {
    type: Boolean,
    required: false
  },
  hasDaoVoting: {
    type: Boolean,
    required: false
  }
})

const Admin = model<IAdmin>('Admin', AdminSchema);

export { Admin, IAdmin }