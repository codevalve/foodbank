import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { createClient } from '@supabase/supabase-js';
import organizationRoutes from './routes/organizations';
import userRoutes from './routes/users';
import inventoryRoutes from './routes/inventory';
import volunteerRoutes from './routes/volunteers';
import clientRoutes from './routes/clients';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Auth middleware for protected routes
app.use(authMiddleware);

// Routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/clients', clientRoutes);

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
