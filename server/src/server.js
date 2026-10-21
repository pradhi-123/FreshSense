import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import app from './app.js';
import { setIO } from './socket.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './services/seedService.js';
import Personnel from './models/Personnel.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const isConnected = await connectDB();

  if (isConnected) {
    const count = await Personnel.countDocuments({});
    if (count === 0) {
      console.log('Seeding initial synthetic data for Anahat...');
      await seedDatabase();
      console.log('Seeded 40 personnel + demo story for p017');
    }
  }

  const httpServer = http.createServer(app);

  const ioServer = new SocketIO(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  // Register the singleton so routes can emit events
  setIO(ioServer);

  ioServer.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);
    socket.on('join', (room) => socket.join(room));
    socket.on('disconnect', () => console.log(`[WS] Disconnected: ${socket.id}`));
  });

  httpServer.listen(PORT, () => {
    console.log(`Anahat Backend running on port ${PORT}`);
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} busy — retrying on 5001`);
      httpServer.listen(5001);
    } else {
      console.error(err);
    }
  });
};

startServer();
