import { Router } from 'express';
import { supabase } from '../index';
import { validate } from '../middleware/validation';
import { clientSchema } from '../schemas';
import { catchAsync } from '../utils/errors';
import { AuthenticatedRequest, Client } from '../types';

const router = Router();

/**
 * @swagger
 * /api/clients:
 *   get:
 *     tags: [Clients]
 *     summary: Get all clients for the organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: household_size_min
 *         schema:
 *           type: integer
 *         description: Filter by minimum household size
 *       - in: query
 *         name: income_level
 *         schema:
 *           type: string
 *         description: Filter by income level
 *     responses:
 *       200:
 *         description: List of clients
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
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *                   household_size:
 *                     type: integer
 *                   income_level:
 *                     type: string
 *                   dietary_restrictions:
 *                     type: array
 *                     items:
 *                       type: string
 *                   notes:
 *                     type: string
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
router.get('/', catchAsync(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', req.user!.organizationId);

  if (error) throw error;
  res.json(data);
}));

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Get client by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *                 household_size:
 *                   type: integer
 *                 income_level:
 *                   type: string
 *                 dietary_restrictions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 notes:
 *                   type: string
 *                 organization_id:
 *                   type: string
 *                   format: uuid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/clients:
 *   post:
 *     tags: [Clients]
 *     summary: Create a new client
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - phone
 *               - address
 *               - household_size
 *               - income_level
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               household_size:
 *                 type: integer
 *                 minimum: 1
 *               income_level:
 *                 type: string
 *               dietary_restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     tags: [Clients]
 *     summary: Update a client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - phone
 *               - address
 *               - household_size
 *               - income_level
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               household_size:
 *                 type: integer
 *                 minimum: 1
 *               income_level:
 *                 type: string
 *               dietary_restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     tags: [Clients]
 *     summary: Delete a client (soft delete by setting status to inactive)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/clients/{id}/visits:
 *   get:
 *     tags: [Clients]
 *     summary: Get client visit history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: List of client visits
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
 *                   visit_date:
 *                     type: string
 *                     format: date-time
 *                   notes:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/clients/{id}/visits:
 *   post:
 *     tags: [Clients]
 *     summary: Record a new client visit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *               served_by:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Visit recorded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal Server Error
 */
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
