import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';

const ROLE_RANK = { viewer: 1, member: 2, admin: 3, owner: 4 };

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireWorkspaceRole(minRole) {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace id required' });
      }
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      const role = workspace.getMemberRole(req.user._id);
      if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
        return res.status(403).json({ message: `Requires ${minRole} role or higher` });
      }
      req.workspace = workspace;
      req.memberRole = role;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export { ROLE_RANK };
