import { Router } from 'express';
import { supabase } from '../index';
import { validate } from '../middleware/validation';
import { clientSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, Client } from '../types';

const router = Router();

// Get all clients for an organization
router.get('/', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', req.user!.organizationId);

  if (error) throw error;
  res.json(data);
}));

// Get a specific client
router.get('/:id', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }

  res.json(data);
}));

// Create a new client
router.post('/', validate(clientSchema), catchAsync(async (req: AuthenticatedRequest, res) => {
  const newClient: Partial<Client> = {
    ...req.body,
    organization_id: req.user!.organizationId,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('clients')
    .insert([newClient])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
}));

// Update a client
router.put('/:id', validate(clientSchema), catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('clients')
    .update(req.body)
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }

  res.json(data);
}));

// Delete a client (soft delete by setting status to inactive)
router.delete('/:id', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('clients')
    .update({ status: 'inactive' })
    .eq('organization_id', req.user!.organizationId)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }

  res.status(200).json({ message: 'Client deactivated successfully' });
}));

// Get client visit history
router.get('/:id/visits', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('client_visits')
    .select('*')
    .eq('organization_id', req.user!.organizationId)
    .eq('client_id', req.params.id)
    .order('visit_date', { ascending: false });

  if (error) throw error;
  res.json(data || []);
}));

// Record a new client visit
router.post('/:id/visits', catchAsync(async (req: AuthenticatedRequest, res) => {
  const visit = {
    client_id: req.params.id,
    organization_id: req.user!.organizationId,
    visit_date: new Date(),
    notes: req.body.notes,
    served_by: req.user!.id,
  };

  const { data, error } = await supabase
    .from('client_visits')
    .insert([visit])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
}));

export default router;
