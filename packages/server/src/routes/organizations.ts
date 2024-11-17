import express from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Get organization details
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

// Update organization details
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

// Get organization statistics
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
