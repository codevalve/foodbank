import { Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validation';
import { mockRequest, mockResponse, mockNext } from '../setup';

describe('Validation Middleware', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(0),
  });

  it('should pass validation with valid data', async () => {
    const req = {
      ...mockRequest(),
      body: {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      },
    } as Request;
    const res = mockResponse() as Response;
    const next = mockNext;

    await validate(testSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should fail validation with invalid data', async () => {
    const req = {
      ...mockRequest(),
      body: {
        name: '',
        email: 'invalid-email',
        age: -1,
      },
    } as Request;
    const res = mockResponse() as Response;
    const next = mockNext;

    await validate(testSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].message).toBe('Invalid input data');
  });

  it('should fail validation with missing required fields', async () => {
    const req = {
      ...mockRequest(),
      body: {
        name: 'Test User',
      },
    } as Request;
    const res = mockResponse() as Response;
    const next = mockNext;

    await validate(testSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].message).toBe('Invalid input data');
  });
});
