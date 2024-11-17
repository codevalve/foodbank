import express, { Response, NextFunction } from 'express';
import { supabase } from '../db';
import { AuthenticatedRequest, ApiResponse, Organization, InventoryTransaction } from '../types';
import { catchAsync } from '../utils/errors';

const router = express.Router();

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get organization details
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const organizationId = req.user?.organization_id;

  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw error;
  }

  if (!organization) {
    throw new Error('Organization not found');
  }

  const response: ApiResponse<Organization> = {
    success: true,
    data: organization,
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/organizations:
 *   put:
 *     summary: Update organization details
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organization'
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const organizationId = req.user?.organization_id;
  const updates = req.body;

  const { data: organization, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const response: ApiResponse<Organization> = {
    success: true,
    data: organization,
    message: 'Organization updated successfully',
  };

  res.json(response);
}));

/**
 * @swagger
 * /api/organizations/stats:
 *   get:
 *     summary: Get organization statistics
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientCount:
 *                   type: number
 *                 volunteerCount:
 *                   type: number
 *                 inventoryCount:
 *                   type: number
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryTransaction'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.get('/stats', catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const organizationId = req.user?.organization_id;

  const [clientsResult, volunteersResult, inventoryResult, transactionsResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId),
    supabase
      .from('volunteers')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId),
    supabase
      .from('inventory_items')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId),
    supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory_items (name)
      `)
      .eq('organization_id', organizationId)
      .order('transaction_date', { ascending: false })
      .limit(10),
  ]);

  const response: ApiResponse<{
    clientCount: number;
    volunteerCount: number;
    inventoryCount: number;
    recentActivity: InventoryTransaction[];
  }> = {
    success: true,
    data: {
      clientCount: clientsResult.count || 0,
      volunteerCount: volunteersResult.count || 0,
      inventoryCount: inventoryResult.count || 0,
      recentActivity: transactionsResult.data || [],
    },
  };

  res.json(response);
}));

export default router;
