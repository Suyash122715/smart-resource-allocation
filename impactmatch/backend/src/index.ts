import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import needRoutes from './routes/needs';
import matchRoutes from './routes/match';
import assignmentRoutes from './routes/assignments';
import volunteerRoutes from './routes/volunteer';
import messageRoutes from './routes/messages';
import mapRoutes from './routes/map';
import notificationRoutes from './routes/notifications';
import { setupSocket } from './services/socketService';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', message: 'ImpactMatch API running' }));

// Setup socket
setupSocket(io);

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/impactmatch';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`🚀 ImpactMatch server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export { io };
