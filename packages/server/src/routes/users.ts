import { Router } from 'express';
import { supabase } from '../index';
import { validate } from '../middleware/validation';
import { userSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, User } from '../types';

const router = Router();

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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   email:
 *                     type: string
 *                     format: email
 *                   name:
 *                     type: string
 *                   role:
 *                     type: string
 *                     enum: [admin, staff, volunteer]
 *                   organization_id:
 *                     type: string
 *                     format: uuid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
// Get all users for an organization
router.get('/', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', req.user!.organizationId);

  if (error) throw error;
  res.json(data);
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
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [admin, staff, volunteer]
 *                 organization_id:
 *                   type: string
 *                   format: uuid
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
router.get('/:id', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(data);
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
router.post('/', validate(userSchema), catchAsync(async (req: AuthenticatedRequest, res) => {
  const newUser: Partial<User> = {
    ...req.body,
    organization_id: req.user!.organizationId,
  };

  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
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
router.put('/:id', validate(userSchema), catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('users')
    .update(req.body)
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json(data);
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
router.delete('/:id', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id);

  if (error) throw error;
  res.status(204).send();
}));

export default router;
