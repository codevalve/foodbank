import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Response } from 'express';
import { User } from '../types';

dotenv.config({ path: '.env.test' });

// Test user data
export const testUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174005',
  email: 'test@example.com',
  role: 'admin',
  organization_id: '123e4567-e89b-12d3-a456-426614174000',
  first_name: 'Test',
  last_name: 'User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock auth user
export const mockAuthUser = {
  id: testUser.id,
  email: testUser.email,
  role: testUser.role,
  organization_id: testUser.organization_id
};

// Mock request object
export const mockRequest = (overrides = {}) => ({
  user: mockAuthUser,
  params: {},
  query: {},
  body: {},
  ...overrides,
});

// Mock response object
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  } as unknown as Response;
  return res;
};

// Mock next function
export const mockNext = jest.fn();

// Create a function that returns a chainable mock
const createChainableMock = (finalValue: any) => {
  const mock = jest.fn();
  
  const chainable = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(finalValue),
    maybeSingle: jest.fn().mockResolvedValue(finalValue),
    execute: jest.fn().mockResolvedValue(finalValue),
    match: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    overlap: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };

  Object.setPrototypeOf(mock, chainable);
  mock.mockResolvedValue(finalValue);

  return mock;
};

// Mock Supabase client
export const mockSupabase = {
  from: jest.fn((table: string) => {
    const defaultResponse = { data: null, error: null };
    const successResponse = { data: [testUser], error: null };
    const singleSuccessResponse = { data: testUser, error: null };

    switch (table) {
      case 'users':
        return createChainableMock(successResponse);
      case 'clients':
        return createChainableMock({ data: [{ count: 100 }], error: null });
      case 'volunteers':
        return createChainableMock({ data: [{ count: 50 }], error: null });
      case 'inventory':
        return createChainableMock({ data: [{ count: 1000 }], error: null });
      case 'inventory_transactions':
        return createChainableMock({
          data: [
            { type: 'in', total: 500 },
            { type: 'out', total: 300 }
          ],
          error: null
        });
      default:
        return createChainableMock(defaultResponse);
    }
  }),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: testUser }, error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: { user: testUser } }, error: null })
  }
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

// Setup and teardown functions
export const clearTestData = async () => {
  // Reset all mocks
  jest.clearAllMocks();
};

beforeAll(async () => {
  await clearTestData();
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await clearTestData();
});
