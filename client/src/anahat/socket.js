import { io } from 'socket.io-client';

// Connect to the same origin that served the page (Vite proxies /socket.io → port 5000).
// Works on phone (10.x.x.x:5173), laptop (localhost:5173), any device on same WiFi.
const socket = io(window.location.origin, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
});

socket.on('connect',       ()  => console.log('[WS] Connected:', socket.id));
socket.on('disconnect',    (r) => console.log('[WS] Disconnected:', r));
socket.on('connect_error', (e) => console.warn('[WS] Connect error:', e.message));

export default socket;
