import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBoard extends Document {
  _id: Types.ObjectId;
  title: string;
  owner: Types.ObjectId | null;
  elements: unknown[];
  appState: Record<string, unknown>;
  thumbnail: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      default: 'Untitled Board',
      trim: true,
      maxlength: 100,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    elements: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    appState: {
      type: Schema.Types.Mixed,
      default: {},
    },
    thumbnail: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We handle timestamps manually
  }
);

// Pre-save hook to update updatedAt
boardSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update hooks to update updatedAt
boardSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.models.Board || mongoose.model<IBoard>('Board', boardSchema);
