import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

function secret() {
  return process.env.JWT_SECRET;
}

export function signToken(userId) {
  return jwt.sign({ id: userId }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    const decoded = jwt.verify(token, secret());
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient role' });
    }
    next();
  };
}
