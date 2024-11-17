import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Create Supabase client for tests
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Test user data
export const testUser = {
  id: '12345',
  email: 'test@example.com',
  role: 'admin',
  organizationId: '67890',
};

// Mock request object
export const mockRequest = () => {
  return {
    user: testUser,
  };
};

// Mock response object
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
export const mockNext = jest.fn();
