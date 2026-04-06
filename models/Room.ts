import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  canvasData: {
    elements: any[];
    appState: any;
  };
}

const RoomSchema = new Schema<IRoom>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    canvasData: {
      elements: {
        type: Array,
        default: [],
      },
      appState: {
        type: Object,
        default: {},
      },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: { expireAfterSeconds: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model already exists to avoid compilation errors
const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
