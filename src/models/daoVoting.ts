import { model, Schema, Document } from 'mongoose';

interface IDaoVoting extends Document {
  agenda: string,
  hostedProjectId: string,
  submittedUser: string,
  options: any[],
  startDate: string,
  endDate: string,
  isEnded: boolean
}

const DaoVotingSchema: Schema = new Schema({
  agenda: {
    type: String,
    required: true,
  },
  hostedProjectId: {
    type: String,
    required: false,
  },
  options: {
    type: Array,
    required: true,
  },
  startDate: {
    type: String,
    required: false,
  },
  endDate: {
    type: String,
    required: false,
  },
  submittedUser: {
    type: String,
    required: false
  },
  isEnded: {
    type: Boolean,
    required: false
  }
})

const DaoVoting = model<IDaoVoting>('DaoVoting', DaoVotingSchema);

export { DaoVoting, IDaoVoting }