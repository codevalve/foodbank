import { Router } from 'express';
import { Response } from 'express';
import { supabase } from '../index';
import { validate } from '../middleware/validation';
import { clientSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, ApiResponse, Client, ClientVisit } from '../types';

const router = Router();

/**
 * @swagger
 * /api/clients:
 *   get:
 *     tags: [Clients]
 *     summary: Get all clients for the organization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clients
 */
router.get('/', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', req.user!.organization_id);

  if (error) throw error;

  const response: ApiResponse<Client[]> = {
    success: true,
    data: data as Client[] || []
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Get client by ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', req.user!.organization_id)
    .eq('id', req.params.id)
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Client not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Client> = {
    success: true,
    data: data as Client
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/clients:
 *   post:
 *     tags: [Clients]
 *     summary: Create a new client
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validate(clientSchema), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const newClient: Partial<Client> = {
    ...req.body,
    organization_id: req.user!.organization_id,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('clients')
    .insert([newClient])
    .select()
    .single();

  if (error) throw error;

  const response: ApiResponse<Client> = {
    success: true,
    data: data as Client,
    message: 'Client created successfully'
  };

  res.status(201).json(response);
}));

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     tags: [Clients]
 *     summary: Update a client
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validate(clientSchema), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabase
    .from('clients')
    .update(req.body)
    .eq('organization_id', req.user!.organization_id)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Client not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Client> = {
    success: true,
    data: data as Client,
    message: 'Client updated successfully'
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     tags: [Clients]
 *     summary: Delete a client (soft delete)
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabase
    .from('clients')
    .update({ status: 'inactive' })
    .eq('organization_id', req.user!.organization_id)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Client not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<null> = {
    success: true,
    message: 'Client deactivated successfully'
  };

  res.status(200).json(response);
}));

/**
 * @swagger
 * /api/clients/{id}/visits:
 *   get:
 *     tags: [Clients]
 *     summary: Get client visit history
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/visits', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { data, error } = await supabase
    .from('client_visits')
    .select('*')
    .eq('organization_id', req.user!.organization_id)
    .eq('client_id', req.params.id)
    .order('visit_date', { ascending: false });

  if (error) throw error;

  const response: ApiResponse<ClientVisit[]> = {
    success: true,
    data: data as ClientVisit[] || []
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/clients/{id}/visits:
 *   post:
 *     tags: [Clients]
 *     summary: Record a new client visit
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/visits', catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const visit: Partial<ClientVisit> = {
    client_id: req.params.id,
    organization_id: req.user!.organization_id,
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

  const response: ApiResponse<ClientVisit> = {
    success: true,
    data: data as ClientVisit,
    message: 'Visit recorded successfully'
  };

  res.status(201).json(response);
}));

export default router;
