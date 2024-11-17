import request from 'supertest';
import { app } from '../../app';
import { mockSupabase } from '../setup';
import { testUser } from '../setup';
import { User } from '../../types';

jest.mock('@supabase/supabase-js');

describe('Users Routes', () => {
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'new@example.com',
        role: 'admin',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        first_name: 'New',
        last_name: 'User'
      };

      const expectedResponse = {
        data: { ...newUser, id: '123e4567-e89b-12d3-a456-426614174001' },
        error: null
      };

      mockSupabase.from = jest.fn().mockReturnValueOnce(
        createChainableMock(expectedResponse)
      );

      const response = await request(app)
        .post('/api/users')
        .set('user', JSON.stringify(testUser))
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(newUser.email);
    });
  });

  describe('GET /api/users', () => {
    it('should get all users for an organization', async () => {
      const users = [
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          email: 'user1@example.com',
          role: 'admin',
          organization_id: '123e4567-e89b-12d3-a456-426614174000',
          first_name: 'User',
          last_name: 'One'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174003',
          email: 'user2@example.com',
          role: 'user',
          organization_id: '123e4567-e89b-12d3-a456-426614174000',
          first_name: 'User',
          last_name: 'Two'
        }
      ];

      const mockChain = jest.fn();
      Object.assign(mockChain, {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: users, error: null })
      });
      mockSupabase.from.mockReturnValueOnce(mockChain);

      const response = await request(app)
        .get('/api/users')
        .set('user', JSON.stringify(testUser));

      console.log('Response:', response.body); // Debug log

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].email).toBe(users[0].email);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update an existing user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174004';
      const updates = {
        email: 'updated@example.com',
        first_name: 'Updated',
        last_name: 'User',
        role: 'admin',
        organization_id: '123e4567-e89b-12d3-a456-426614174000'
      };

      const expectedResponse = {
        data: { id: userId, ...updates },
        error: null
      };

      mockSupabase.from = jest.fn().mockReturnValueOnce(
        createChainableMock(expectedResponse)
      );

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('user', JSON.stringify(testUser))
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(updates.email);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const userId = 'test-user-id';

      mockSupabase.from = jest.fn().mockReturnValueOnce(
        createChainableMock({ data: null, error: null })
      );

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');
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
