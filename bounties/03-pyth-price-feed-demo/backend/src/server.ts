import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import pricesRouter from './routes/prices';
import alertsRouter from './routes/alerts';
import liquidationsRouter from './routes/liquidations';
import { websocketService } from './services/WebsocketService';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Pyth Oracle Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      prices: '/api/prices/current',
      alerts: '/api/alerts/:userAddress',
      liquidations: '/api/liquidations/:userAddress',
      websocket: `ws://localhost:${PORT}/ws`
    }
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/prices', pricesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/liquidations', liquidationsRouter);

app.use((_req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${_req.method} ${_req.path}`);
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: _req.path,
    method: _req.method
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const server = createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  logger.info('✓ WebSocket client connected');
  websocketService.addClient(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      websocketService.handleMessage(ws, data);
    } catch (error) {
      logger.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    logger.info('✗ WebSocket client disconnected');
    websocketService.removeClient(ws);
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📡 WebSocket server: ws://localhost:${PORT}/ws`);
  logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('📋 Available Routes:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/prices/current`);
  console.log(`   GET  http://localhost:${PORT}/api/prices/:symbol`);
  console.log(`   GET  http://localhost:${PORT}/api/alerts/:userAddress`);
  console.log(`   POST http://localhost:${PORT}/api/alerts`);
  console.log('='.repeat(60) + '\n');
  
  websocketService.startPriceStreaming();
});

const shutdown = () => {
  logger.info('Shutdown signal received, closing server gracefully...');
  websocketService.stopPriceStreaming();
  server.close(() => {
    logger.info('✓ Server closed successfully');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;