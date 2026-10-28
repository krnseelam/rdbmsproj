import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

import artistRoutes from './routes/artistRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import songRoutes from './routes/songRoutes.js';
import producerRoutes from './routes/producerRoutes.js';
import songwriterRoutes from './routes/songwriterRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import royaltyRoutes from './routes/royaltyRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: process.env.DB_NAME || 'music_label_db',
    environment: process.env.NODE_ENV || 'development',
    platform: process.env.VERCEL ? 'vercel-serverless' : 'standalone-node',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/songwriters', songwriterRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/royalties', royaltyRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
