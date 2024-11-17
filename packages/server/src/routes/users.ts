import express, { Response } from 'express';
import { supabase } from '../db';
import { validate } from '../middleware/validation';
import { userSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, ApiResponse, User } from '../types';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users for the organization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       email:
 *                         type: string
 *                         format: email
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [admin, staff, volunteer]
 *                       organization_id:
 *                         type: string
 *                         format: uuid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
// Get all users for an organization
router.get('/', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const organization_id = req.user?.organization_id;

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organization_id)
    .order('name');

  if (error) {
    throw new AppError('Failed to fetch users', 500);
  }

  const response: ApiResponse<User[]> = {
    success: true,
    data: users
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, staff, volunteer]
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
// Get a specific user
router.get('/:id', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const organization_id = req.user?.organization_id;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organization_id)
    .single();

  if (error || !user) {
    throw new AppError('User not found', 404);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, staff, volunteer]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, staff, volunteer]
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
// Create a new user
router.post('/', validate(userSchema), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const organization_id = req.user?.organization_id;
  const newUser: Partial<User> = {
    ...req.body,
    organization_id: organization_id
  };

  const { data: user, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to create user', 500);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'User created successfully'
  };

  res.status(201).json(response);
}));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, staff, volunteer]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, staff, volunteer]
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
// Update a user
router.put('/:id', validate(userSchema), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const organization_id = req.user?.organization_id;
  const updates: Partial<User> = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organization_id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update user', 500);
  }

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'User updated successfully'
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
// Delete a user
router.delete('/:id', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const organization_id = req.user?.organization_id;

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('organization_id', organization_id);

  if (error) {
    throw new AppError('Failed to delete user', 500);
  }

  const response: ApiResponse<null> = {
    success: true,
    message: 'User deleted successfully'
  };

  res.json(response);
}));

export default router;
