import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['seeker', 'poster', 'admin'], default: 'seeker' },
    headline: { type: String, default: '', maxlength: 160 },
    bio: { type: String, default: '', maxlength: 2000 },
    skills: [{ type: String, maxlength: 40 }],
    metro: { type: String, default: '', maxlength: 80 },
    province: { type: String, default: '', maxlength: 80 },
    whatsapp: { type: String, default: '', maxlength: 20 },
    dataSaver: { type: Boolean, default: true },
    avatarColor: { type: String, default: '#F4A261' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
