import { Notification } from '../models/Notification.js';

export async function createAndEmitNotification(io, { userId, type, title, body, link, meta }) {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    body,
    link,
    meta,
  });

  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }

  return notification;
}
