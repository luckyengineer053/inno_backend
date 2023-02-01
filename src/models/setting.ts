import { model, Schema, Document } from 'mongoose';

interface ISetting extends Document {
  key: string,
  value: string,
  description: string,
}
const SettingSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  }
})

const Setting = model<ISetting>('Setting', SettingSchema);

export { Setting, ISetting }