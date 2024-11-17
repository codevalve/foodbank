import { Router } from 'express';
import { supabase } from '../index';
import { validate } from '../middleware/validation';
import { volunteerSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, Volunteer } from '../types';

const router = Router();

// Get all volunteers for an organization
router.get('/', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('organization_id', req.user!.organizationId);

  if (error) throw error;
  res.json(data);
}));

// Get a specific volunteer
router.get('/:id', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }

  res.json(data);
}));

// Create a new volunteer
router.post('/', validate(volunteerSchema), catchAsync(async (req: AuthenticatedRequest, res) => {
  const newVolunteer: Partial<Volunteer> = {
    ...req.body,
    organization_id: req.user!.organizationId,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('volunteers')
    .insert([newVolunteer])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
}));

// Update a volunteer
router.put('/:id', validate(volunteerSchema), catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('volunteers')
    .update(req.body)
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }

  res.json(data);
}));

// Delete a volunteer (soft delete by setting status to inactive)
router.delete('/:id', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('volunteers')
    .update({ status: 'inactive' })
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }

  res.status(200).json({ message: 'Volunteer deactivated successfully' });
}));

// Get volunteer availability
router.get('/:id/availability', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('volunteers')
    .select('availability')
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }

  res.json(data.availability || []);
}));

// Update volunteer availability
router.put('/:id/availability', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { availability } = req.body;

  const { data, error } = await supabase
    .from('volunteers')
    .update({ availability })
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }

  res.json(data);
}));

export default router;
