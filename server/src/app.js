import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import checkinRoutes from './routes/checkin.routes.js';
import alertRoutes from './routes/alert.routes.js';
import unitRoutes from './routes/unit.routes.js';
import demoRoutes from './routes/demo.routes.js';
import voiceRoutes from './routes/voice.routes.js';
import aiRoutes from './routes/ai.routes.js';
import craftsRoutes from './routes/crafts.routes.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Role', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Core Virasat API Routes
app.use('/api', checkinRoutes);
app.use('/api', alertRoutes);
app.use('/api', unitRoutes);
app.use('/api', demoRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/crafts', craftsRoutes);
app.use('/api', craftsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Anahat Backend API', time: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    detail: { code: 'error', message: err.message || 'Internal Server Error' }
  });
});

export default app;
