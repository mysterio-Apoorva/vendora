import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import env from './config/env';
import routes from './api/routes';
import { errorMiddleware } from './api/middlewares/error.middleware';
import { initSocket } from './config/socket';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error Handling
app.use(errorMiddleware);

const PORT = env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Vendora Backend running on port ${PORT} in ${env.NODE_ENV} mode`);
});
