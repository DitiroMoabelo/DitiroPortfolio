import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    members: [memberSchema],
  },
  { timestamps: true }
);

workspaceSchema.methods.getMemberRole = function getMemberRole(userId) {
  const member = this.members.find((m) => m.user.toString() === userId.toString());
  return member?.role || null;
};

export const Workspace = mongoose.model('Workspace', workspaceSchema);
