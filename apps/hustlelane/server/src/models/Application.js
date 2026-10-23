import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coverNote: { type: String, default: '' },
    status: {
      type: String,
      enum: ['submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ opportunity: 1, seeker: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
