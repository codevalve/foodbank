import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './config/swagger';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import usersRouter from './routes/users';
import organizationsRouter from './routes/organizations';
import inventoryRouter from './routes/inventory';
import volunteersRouter from './routes/volunteers';
import clientsRouter from './routes/clients';

// Create Express app
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth middleware for protected routes
app.use(authMiddleware);

// Routes
app.use('/api/users', usersRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/clients', clientsRouter);

// Error handling
app.use(errorHandler);

export default app;
