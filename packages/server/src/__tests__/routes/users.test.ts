import { Request, Response } from 'express';
import { supabase } from '../../index';
import usersRouter from '../../routes/users';
import { mockRequest, mockResponse, mockNext, testUser } from '../setup';

// Mock Supabase client
jest.mock('../../index', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));

describe('Users Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return all users for an organization', async () => {
      const users = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ];

      (supabase.from().select().eq as jest.Mock).mockResolvedValueOnce({
        data: users,
        error: null,
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      await usersRouter.handle(req, res);

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from().select().eq).toHaveBeenCalledWith(
        'organization_id',
        testUser.organizationId
      );
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('should handle errors when fetching users', async () => {
      const error = new Error('Database error');

      (supabase.from().select().eq as jest.Mock).mockResolvedValueOnce({
        data: null,
        error,
      });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      await usersRouter.handle(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('POST /', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        role: 'staff',
        first_name: 'New',
        last_name: 'User',
      };

      const createdUser = {
        ...newUser,
        id: '123',
        organization_id: testUser.organizationId,
      };

      (supabase.from().insert().select().single as jest.Mock).mockResolvedValueOnce({
        data: createdUser,
        error: null,
      });

      const req = {
        ...mockRequest(),
        body: newUser,
      } as Request;
      const res = mockResponse() as Response;

      await usersRouter.handle(req, res);

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from().insert).toHaveBeenCalledWith([
        {
          ...newUser,
          organization_id: testUser.organizationId,
        },
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it('should handle validation errors', async () => {
      const invalidUser = {
        email: 'invalid-email',
        role: 'invalid-role',
      };

      const req = {
        ...mockRequest(),
        body: invalidUser,
      } as Request;
      const res = mockResponse() as Response;
      const next = mockNext;

      await usersRouter.handle(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    it('should update an existing user', async () => {
      const userId = '123';
      const updates = {
        email: 'updated@example.com',
        first_name: 'Updated',
      };

      const updatedUser = {
        ...updates,
        id: userId,
        organization_id: testUser.organizationId,
      };

      (supabase.from().update().eq().select().single as jest.Mock).mockResolvedValueOnce({
        data: updatedUser,
        error: null,
      });

      const req = {
        ...mockRequest(),
        params: { id: userId },
        body: updates,
      } as unknown as Request;
      const res = mockResponse() as Response;

      await usersRouter.handle(req, res);

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from().update().eq().eq).toHaveBeenCalledWith('id', userId);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a user', async () => {
      const userId = '123';

      (supabase.from().delete().eq().eq as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      const req = {
        ...mockRequest(),
        params: { id: userId },
      } as unknown as Request;
      const res = mockResponse() as Response;

      await usersRouter.handle(req, res);

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from().delete().eq().eq).toHaveBeenCalledWith('id', userId);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
