import { describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { validate } from '../../middleware/validation';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  const schema = z.object({
    name: z.string(),
    email: z.string().email()
  });

  it('should pass validation with valid data', () => {
    req.body = {
      name: 'Test User',
      email: 'test@example.com'
    };

    validate(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should fail validation with invalid data', () => {
    req.body = {
      name: 'Test User',
      email: 'invalid-email'
    };

    validate(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toContain('Invalid email');
  });
});
