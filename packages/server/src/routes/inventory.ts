import express from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Get all inventory items for the organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Filter low stock items
 *     responses:
 *       200:
 *         description: List of inventory items
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
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   unit:
 *                     type: string
 *                   minimum_quantity:
 *                     type: integer
 *                   expiration_date:
 *                     type: string
 *                     format: date-time
 *                   location:
 *                     type: string
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

/**
 * @swagger
 * /api/inventory/categories:
 *   get:
 *     tags: [Inventory]
 *     summary: Get all inventory categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unique inventory categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     tags: [Inventory]
 *     summary: Create a new inventory item
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
 *               - category_id
 *               - sku
 *               - barcode
 *               - unit_type
 *               - minimum_stock
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: string
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *               unit_type:
 *                 type: string
 *               minimum_stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/inventory/transaction:
 *   post:
 *     tags: [Inventory]
 *     summary: Record an inventory transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - transaction_type
 *               - quantity
 *               - notes
 *             properties:
 *               item_id:
 *                 type: string
 *               transaction_type:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory transaction recorded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory item details with transaction history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory Item ID
 *     responses:
 *       200:
 *         description: Inventory item details with transaction history
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
 *                 category:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 unit:
 *                   type: string
 *                 minimum_quantity:
 *                   type: integer
 *                 expiration_date:
 *                   type: string
 *                   format: date-time
 *                 location:
 *                   type: string
 *                 notes:
 *                   type: string
 *                 organization_id:
 *                   type: string
 *                   format: uuid
 *                 current_stock:
 *                   type: integer
 *                 recent_transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       item_id:
 *                         type: string
 *                         format: uuid
 *                       transaction_type:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       notes:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       transaction_date:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     tags: [Inventory]
 *     summary: Update an inventory item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *               - sku
 *               - barcode
 *               - unit_type
 *               - minimum_stock
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: string
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *               unit_type:
 *                 type: string
 *               minimum_stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/inventory/alerts/low-stock:
 *   get:
 *     tags: [Inventory]
 *     summary: Get low stock alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low stock items
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
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   unit:
 *                     type: string
 *                   minimum_quantity:
 *                     type: integer
 *                   expiration_date:
 *                     type: string
 *                     format: date-time
 *                   location:
 *                     type: string
 *                   notes:
 *                     type: string
 *                   organization_id:
 *                     type: string
 *                     format: uuid
 *                   current_stock:
 *                     type: integer
 *                   shortage:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
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
