import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['learnership', 'bursary', 'internship', 'gig', 'entry-level', 'freelance'],
      required: true,
      index: true,
    },
    province: { type: String, required: true, index: true },
    metro: { type: String, required: true, index: true },
    remote: { type: Boolean, default: false },
    stipendZar: { type: Number, default: 0 },
    unpaid: { type: Boolean, default: false },
    loadSheddingFriendly: { type: Boolean, default: false },
    tags: [{ type: String }],
    whatsappContact: { type: String, default: '' },
    applyUrl: { type: String, default: '' },
    deadline: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

opportunitySchema.index({ title: 'text', company: 'text', description: 'text', tags: 'text' });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
