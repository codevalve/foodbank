import request from 'supertest';
import { app } from '../../app';
import { mockSupabase } from '../setup';
import { testUser } from '../setup';
import { Organization } from '../../types';

jest.mock('@supabase/supabase-js');

describe('Organizations Routes', () => {
  describe('GET /api/organizations', () => {
    it('should return organization details', async () => {
      const testOrganization = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Food Bank',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        phone: '123-456-7890',
        email: 'test@foodbank.org'
      };

      mockSupabase.from = jest.fn().mockReturnValueOnce(
        createChainableMock({ data: testOrganization, error: null })
      );

      const response = await request(app)
        .get('/api/organizations')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body.data?.name).toBe(testOrganization.name);
    });
  });

  describe('PUT /api/organizations', () => {
    it('should update organization details', async () => {
      const updates = {
        name: 'Updated Food Bank',
        phone: '987-654-3210'
      };

      mockSupabase.from = jest.fn().mockReturnValueOnce(
        createChainableMock({ data: { id: '123e4567-e89b-12d3-a456-426614174000', ...updates }, error: null })
      );

      const response = await request(app)
        .put('/api/organizations')
        .set('user', JSON.stringify(testUser))
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.data?.name).toBe(updates.name);
      expect(response.body.data?.phone).toBe(updates.phone);
    });
  });

  describe('GET /api/organizations/stats', () => {
    it('should return organization statistics', async () => {
      const mockData = {
        clients: [{ count: 100 }],
        volunteers: [{ count: 50 }],
        inventory: [{ count: 1000 }],
        transactions: [
          { type: 'in', total: 500 },
          { type: 'out', total: 300 }
        ]
      };

      // Mock each database call
      mockSupabase.from = jest.fn()
        .mockImplementation((table: string) => {
          switch (table) {
            case 'clients':
              return createChainableMock({ data: mockData.clients, error: null });
            case 'volunteers':
              return createChainableMock({ data: mockData.volunteers, error: null });
            case 'inventory':
              return createChainableMock({ data: mockData.inventory, error: null });
            case 'inventory_transactions':
              return createChainableMock({ data: mockData.transactions, error: null });
            default:
              return createChainableMock({ data: null, error: null });
          }
        });

      const response = await request(app)
        .get('/api/organizations/stats')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(typeof response.body.data?.clientCount).toBe('number');
      expect(typeof response.body.data?.volunteerCount).toBe('number');
      expect(typeof response.body.data?.inventoryCount).toBe('number');
    });
  });
});

// Helper function to create chainable mock
function createChainableMock(finalValue: any) {
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
  mock.mockReturnThis();
  mock.mockImplementation(() => chainable);

  return mock;
}
