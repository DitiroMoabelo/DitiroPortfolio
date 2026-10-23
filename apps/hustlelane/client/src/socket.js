import { io } from 'socket.io-client';

function defaultSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.DEV) return 'http://localhost:5002';
  // Production same-origin (Render all-in-one) or leave empty for current host
  return window.location.origin;
}

let socket = null;

export function connectSocket(token) {
  if (socket) socket.disconnect();
  socket = io(defaultSocketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
