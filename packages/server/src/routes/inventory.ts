import express from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Get all inventory items
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        category:inventory_categories(name)
      `)
      .eq('organization_id', req.user!.organization_id)
      .order('name');

    if (error) throw new AppError('Failed to fetch inventory items', 400);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get inventory categories
router.get('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .eq('organization_id', req.user!.organization_id)
      .order('name');

    if (error) throw new AppError('Failed to fetch categories', 400);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Add new inventory item
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      description,
      category_id,
      sku,
      barcode,
      unit_type,
      minimum_stock
    } = req.body;

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name,
        description,
        category_id,
        sku,
        barcode,
        unit_type,
        minimum_stock,
        organization_id: req.user!.organization_id
      })
      .select()
      .single();

    if (error) throw new AppError('Failed to create inventory item', 400);

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Record inventory transaction
router.post('/transaction', async (req, res, next) => {
  try {
    const { item_id, transaction_type, quantity, notes } = req.body;

    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert({
        item_id,
        transaction_type,
        quantity,
        notes,
        organization_id: req.user!.organization_id,
        user_id: req.user!.id
      })
      .select()
      .single();

    if (error) throw new AppError('Failed to record transaction', 400);

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Get inventory item details with transaction history
router.get('/:id', async (req, res, next) => {
  try {
    const [itemResult, transactionsResult] = await Promise.all([
      supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(name)
        `)
        .eq('id', req.params.id)
        .eq('organization_id', req.user!.organization_id)
        .single(),
      supabase
        .from('inventory_transactions')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .eq('item_id', req.params.id)
        .order('transaction_date', { ascending: false })
        .limit(10)
    ]);

    if (itemResult.error) throw new AppError('Failed to fetch inventory item', 400);
    if (!itemResult.data) throw new AppError('Inventory item not found', 404);

    // Calculate current stock level
    const transactions = transactionsResult.data || [];
    const stockLevel = transactions.reduce((total, trans) => {
      return total + (trans.transaction_type === 'donation_in' ? trans.quantity : -trans.quantity);
    }, 0);

    res.json({
      ...itemResult.data,
      current_stock: stockLevel,
      recent_transactions: transactions
    });
  } catch (error) {
    next(error);
  }
});

// Update inventory item
router.put('/:id', async (req, res, next) => {
  try {
    const {
      name,
      description,
      category_id,
      sku,
      barcode,
      unit_type,
      minimum_stock
    } = req.body;

    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        name,
        description,
        category_id,
        sku,
        barcode,
        unit_type,
        minimum_stock
      })
      .eq('id', req.params.id)
      .eq('organization_id', req.user!.organization_id)
      .select()
      .single();

    if (error) throw new AppError('Failed to update inventory item', 400);
    if (!data) throw new AppError('Inventory item not found', 404);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', async (req, res, next) => {
  try {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select(`
        id,
        name,
        minimum_stock,
        category:inventory_categories(name)
      `)
      .eq('organization_id', req.user!.organization_id);

    if (error) throw new AppError('Failed to fetch inventory items', 400);

    // For each item, calculate current stock and check if it's below minimum
    const lowStockItems = await Promise.all(
      items.map(async (item) => {
        const { data: transactions } = await supabase
          .from('inventory_transactions')
          .select('quantity, transaction_type')
          .eq('item_id', item.id);

        const currentStock = (transactions || []).reduce((total, trans) => {
          return total + (trans.transaction_type === 'donation_in' ? trans.quantity : -trans.quantity);
        }, 0);

        if (currentStock < item.minimum_stock) {
          return {
            ...item,
            current_stock: currentStock,
            shortage: item.minimum_stock - currentStock
          };
        }
        return null;
      })
    );

    res.json(lowStockItems.filter(item => item !== null));
  } catch (error) {
    next(error);
  }
});

export default router;
