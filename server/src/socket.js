/**
 * Singleton Socket.io instance — imported by routes to emit events.
 * Avoids circular imports between server.js ↔ routes.
 */
let _io = null;

export function setIO(ioInstance) {
  _io = ioInstance;
}

export function getIO() {
  return _io;
}

// Convenience proxy — emits silently if io not yet initialised
export const io = {
  emit: (...args) => { if (_io) _io.emit(...args); },
  to:   (room) => ({ emit: (...args) => { if (_io) _io.to(room).emit(...args); } }),
};
