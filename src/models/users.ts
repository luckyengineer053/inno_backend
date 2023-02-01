import { model, Schema, Document } from 'mongoose'

interface IUsers extends Document {
  discordId: string,
  discordName: string,
  twitterId: string,
  twitterUserName: string,
  nftTickets: number,
  wlTickets: number
}

const UsersSchema: Schema = new Schema({
  discordId: {
    type: String,
    required: true
  },
  discordName: {
    type: String,
    required: false
  },
  twitterId: {
    type: String
  },
  twitterUserName: {
    type: String
  },
  nftTickets: {
    type: Number,
    required: false
  },
  wlTickets: {
    type: Number,
    required: false
  }
})

const Users = model<IUsers>('Users', UsersSchema)

export { Users, IUsers }