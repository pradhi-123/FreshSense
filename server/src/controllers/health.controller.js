import mongoose from 'mongoose';

export const getHealthStatus = (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    db: isConnected ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    time: new Date().toISOString(),
  });
};
