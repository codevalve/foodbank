import { Router } from 'express';
import { supabase } from '../index';
import { validate } from '../middleware/validation';
import { userSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, User } from '../types';

const router = Router();

// Get all users for an organization
router.get('/', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', req.user!.organizationId);

  if (error) throw error;
  res.json(data);
}));

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
