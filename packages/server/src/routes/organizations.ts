import express from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     tags: [Organizations]
 *     summary: Get organization details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 website:
 *                   type: string
 *                   format: uri
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', req.user!.organization_id)
      .single();

    if (error) throw new AppError('Failed to fetch organization', 400);
    if (!data) throw new AppError('Organization not found', 404);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/organizations:
 *   put:
 *     tags: [Organizations]
 *     summary: Update organization details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/', async (req, res, next) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Only admins can update organization details', 403);
    }

    const { name, address, phone, email, website } = req.body;

    const { data, error } = await supabase
      .from('organizations')
      .update({ name, address, phone, email, website })
      .eq('id', req.user!.organization_id)
      .select()
      .single();

    if (error) throw new AppError('Failed to update organization', 400);
    if (!data) throw new AppError('Organization not found', 404);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/organizations/stats:
 *   get:
 *     tags: [Organizations]
 *     summary: Get organization statistics
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
 *                 stats:
 *                   type: object
 *                   properties:
 *                     volunteers:
 *                       type: integer
 *                     clients:
 *                       type: integer
 *                     inventory:
 *                       type: integer
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       transaction_type:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       transaction_date:
 *                         type: string
 *                         format: date-time
 *                       inventory_items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/stats', async (req, res, next) => {
  try {
    const orgId = req.user!.organization_id;

    // Get counts from different tables
    const [
      { count: volunteersCount },
      { count: clientsCount },
      { count: inventoryCount }
    ] = await Promise.all([
      supabase
        .from('volunteers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
    ]);

    // Get recent activity
    const { data: recentTransactions } = await supabase
      .from('inventory_transactions')
      .select(`
        id,
        transaction_type,
        quantity,
        transaction_date,
        inventory_items (name)
      `)
      .eq('organization_id', orgId)
      .order('transaction_date', { ascending: false })
      .limit(5);

    res.json({
      stats: {
        volunteers: volunteersCount,
        clients: clientsCount,
        inventory: inventoryCount
      },
      recentActivity: recentTransactions
    });
  } catch (error) {
    next(error);
  }
});

export default router;
