import request from 'supertest';
import { app } from '../../app';
import { mockSupabase, testUser } from '../setup';
import { InventoryItemWithStock } from '../../types';

// Helper function to create a mock chain that extends jest.Mock
function createMockChain<T extends object>(methods: T): jest.Mock & T {
  const mockFn = jest.fn() as jest.Mock & T;
  Object.assign(mockFn, methods);
  return mockFn;
}

type Transaction = {
  transaction_type: string;
  quantity: number;
};

type TransactionMap = {
  [key: string]: Transaction[];
};

describe('Inventory Routes', () => {
  describe('GET /api/inventory', () => {
    it('should get all inventory items for an organization', async () => {
      const mockItems = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Canned Soup',
          category_id: '123e4567-e89b-12d3-a456-426614174010',
          organization_id: testUser.organization_id,
          minimum_stock: 100,
          unit: 'cans',
          location: 'Shelf A1',
          notes: 'Vegetable soup',
          category: {
            id: '123e4567-e89b-12d3-a456-426614174010',
            name: 'Canned Goods',
            organization_id: testUser.organization_id
          },
          current_stock: [
            { transaction_type: 'donation_in', quantity: 150 },
            { transaction_type: 'distribution', quantity: 30 }
          ]
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Rice',
          category_id: '123e4567-e89b-12d3-a456-426614174011',
          organization_id: testUser.organization_id,
          minimum_stock: 50,
          unit: 'bags',
          location: 'Shelf B1',
          notes: 'Long grain',
          category: {
            id: '123e4567-e89b-12d3-a456-426614174011',
            name: 'Grains',
            organization_id: testUser.organization_id
          },
          current_stock: [
            { transaction_type: 'donation_in', quantity: 40 },
            { transaction_type: 'distribution', quantity: 20 }
          ]
        }
      ];

      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockItems, error: null })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get('/api/inventory')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      
      // Verify stock calculations
      const items = response.body.data as InventoryItemWithStock[];
      expect(items[0].current_stock).toBe(120); // 150 - 30
      expect(items[1].current_stock).toBe(20); // 40 - 20
    });

    it('should filter low stock items', async () => {
      const mockItems = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Canned Soup',
          minimum_stock: 100,
          current_stock: [
            { transaction_type: 'donation_in', quantity: 80 }
          ]
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Rice',
          minimum_stock: 50,
          current_stock: [
            { transaction_type: 'donation_in', quantity: 100 }
          ]
        }
      ];

      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockItems, error: null })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get('/api/inventory?low_stock=true')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Canned Soup');
    });

    it('should handle database errors', async () => {
      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get('/api/inventory')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to fetch inventory items');
    });
  });

  describe('POST /api/inventory', () => {
    it('should create a new inventory item', async () => {
      const newItem = {
        name: 'New Item',
        category_id: '123e4567-e89b-12d3-a456-426614174010',
        organization_id: testUser.organization_id,
        minimum_stock: 50,
        unit: 'boxes',
        location: 'Shelf C1',
        notes: 'Test item'
      };

      const mockChain = createMockChain({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { ...newItem, id: '123e4567-e89b-12d3-a456-426614174003' },
          error: null 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .post('/api/inventory')
        .set('user', JSON.stringify(testUser))
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({ ...newItem, id: '123e4567-e89b-12d3-a456-426614174003' });
      expect(response.body.message).toBe('Inventory item created successfully');
    });

    it('should handle database errors when creating item', async () => {
      const mockChain = createMockChain({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .post('/api/inventory')
        .set('user', JSON.stringify(testUser))
        .send({
          name: 'Test Item',
          category_id: '123e4567-e89b-12d3-a456-426614174010',
          organization_id: testUser.organization_id,
          minimum_stock: 50,
          unit: 'boxes',
          location: 'Shelf C1',
          notes: 'Test item'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to create inventory item');
    });
  });

  describe('GET /api/inventory/categories', () => {
    it('should get all inventory categories', async () => {
      const mockCategories = [
        {
          id: '123e4567-e89b-12d3-a456-426614174010',
          name: 'Canned Goods',
          organization_id: testUser.organization_id
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174011',
          name: 'Grains',
          organization_id: testUser.organization_id
        }
      ];

      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCategories, error: null })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get('/api/inventory/categories')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Canned Goods');
      expect(response.body[1].name).toBe('Grains');
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get('/api/inventory/categories')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to fetch categories');
    });
  });

  describe('POST /api/inventory/transaction', () => {
    it('should record an inventory transaction', async () => {
      const transaction = {
        item_id: '123e4567-e89b-12d3-a456-426614174001',
        transaction_type: 'donation_in',
        quantity: 50,
        notes: 'Test donation'
      };

      const mockResponse = {
        id: '123e4567-e89b-12d3-a456-426614174088',
        ...transaction,
        organization_id: testUser.organization_id,
        user_id: testUser.id,
        created_at: new Date().toISOString()
      };

      const mockChain = createMockChain({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .post('/api/inventory/transaction')
        .set('user', JSON.stringify(testUser))
        .send(transaction);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(mockResponse);
    });

    it('should handle database errors when recording transaction', async () => {
      const mockChain = createMockChain({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .post('/api/inventory/transaction')
        .set('user', JSON.stringify(testUser))
        .send({
          item_id: '123e4567-e89b-12d3-a456-426614174001',
          transaction_type: 'donation_in',
          quantity: 50,
          notes: 'Test donation'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to record transaction');
    });
  });

  describe('GET /api/inventory/:id', () => {
    const mockItem = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Canned Soup',
      category_id: '123e4567-e89b-12d3-a456-426614174010',
      organization_id: testUser.organization_id,
      minimum_stock: 100,
      unit: 'cans',
      location: 'Shelf A1',
      notes: 'Vegetable soup',
      category: {
        id: '123e4567-e89b-12d3-a456-426614174010',
        name: 'Canned Goods',
        organization_id: testUser.organization_id
      },
      current_stock: [
        { transaction_type: 'donation_in', quantity: 150 },
        { transaction_type: 'distribution', quantity: 30 }
      ]
    };

    const mockTransactions = [
      {
        id: '123e4567-e89b-12d3-a456-426614174088',
        item_id: mockItem.id,
        transaction_type: 'donation_in',
        quantity: 150,
        notes: 'Initial stock',
        user_id: testUser.id,
        organization_id: testUser.organization_id,
        transaction_date: new Date().toISOString()
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174089',
        item_id: mockItem.id,
        transaction_type: 'distribution',
        quantity: 30,
        notes: 'Distribution to family',
        user_id: testUser.id,
        organization_id: testUser.organization_id,
        transaction_date: new Date().toISOString()
      }
    ];

    it('should get inventory item details with transaction history', async () => {
      const mockItemChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockItem, error: null })
      });

      const mockTransactionChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockTransactions, error: null })
      });

      mockSupabase.from.mockImplementation((table: string) => {
        return table === 'inventory_items' ? mockItemChain : mockTransactionChain;
      });

      const response = await request(app)
        .get(`/api/inventory/${mockItem.id}`)
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        ...mockItem,
        recent_transactions: mockTransactions
      });
    });

    it('should return 404 when item not found', async () => {
      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get('/api/inventory/non-existent-id')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Inventory item not found');
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get(`/api/inventory/${mockItem.id}`)
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Inventory item not found');
    });
  });

  describe('PUT /api/inventory/:id', () => {
    const mockItem = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Canned Soup',
      category_id: '123e4567-e89b-12d3-a456-426614174010',
      organization_id: testUser.organization_id,
      sku: 'SKU123',
      barcode: 'BAR123',
      unit_type: 'cans',
      minimum_stock: 100,
      description: 'Original description',
      notes: 'Original notes'
    };

    it('should update an inventory item successfully', async () => {
      const updateData = {
        name: 'Updated Canned Soup',
        category_id: mockItem.category_id,
        sku: 'SKU123-UPDATED',
        barcode: 'BAR123-UPDATED',
        unit_type: 'cans',
        minimum_stock: 150,
        description: 'Updated description',
        notes: 'Updated notes'
      };

      const mockResponse = {
        ...mockItem,
        ...updateData
      };

      const mockChain = createMockChain({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResponse, error: null })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .put(`/api/inventory/${mockItem.id}`)
        .set('user', JSON.stringify(testUser))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(mockResponse);
    });

    it('should return 404 when updating non-existent item', async () => {
      const mockChain = createMockChain({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .put('/api/inventory/non-existent-id')
        .set('user', JSON.stringify(testUser))
        .send({
          name: 'Test Item',
          category_id: '123e4567-e89b-12d3-a456-426614174010',
          sku: 'SKU123',
          barcode: 'BAR123',
          unit_type: 'pieces',
          minimum_stock: 50
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Inventory item not found');
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = createMockChain({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .put(`/api/inventory/${mockItem.id}`)
        .set('user', JSON.stringify(testUser))
        .send({
          name: 'Updated Item',
          category_id: mockItem.category_id,
          sku: 'SKU123',
          barcode: 'BAR123',
          unit_type: 'pieces',
          minimum_stock: 50
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to update inventory item');
    });
  });

  describe('GET /api/inventory/alerts/low-stock', () => {
    const mockItems = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Canned Soup',
        minimum_stock: 100,
        category: { name: 'Canned Goods' }
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Rice',
        minimum_stock: 50,
        category: { name: 'Grains' }
      }
    ];

    const mockTransactions: TransactionMap = {
      '123e4567-e89b-12d3-a456-426614174001': [
        { transaction_type: 'donation_in', quantity: 80 },
        { transaction_type: 'distribution', quantity: 30 }
      ],
      '123e4567-e89b-12d3-a456-426614174002': [
        { transaction_type: 'donation_in', quantity: 100 },
        { transaction_type: 'distribution', quantity: 20 }
      ]
    };

    it('should get low stock alerts', async () => {
      const mockItemsChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockItems, error: null })
      });

      const mockTransactionsChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation((field: string, id: string) => {
          return {
            data: mockTransactions[id],
            error: null
          };
        })
      });

      mockSupabase.from.mockImplementation((table: string) => {
        return table === 'inventory_items' ? mockItemsChain : mockTransactionsChain;
      });

      const response = await request(app)
        .get('/api/inventory/alerts/low-stock')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1); // Only Canned Soup should be low on stock
      expect(response.body[0]).toMatchObject({
        name: 'Canned Soup',
        current_stock: 50, // 80 - 30
        shortage: 50, // minimum_stock (100) - current_stock (50)
        category: { name: 'Canned Goods' }
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      });

      mockSupabase.from.mockReturnValue(mockChain);

      const response = await request(app)
        .get('/api/inventory/alerts/low-stock')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to fetch inventory items');
    });

    it('should return empty array when no items are low on stock', async () => {
      const highStockItems = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Well Stocked Item',
          minimum_stock: 50,
          category: { name: 'Canned Goods' }
        }
      ];

      const highStockTransactions: TransactionMap = {
        '123e4567-e89b-12d3-a456-426614174001': [
          { transaction_type: 'donation_in', quantity: 100 }
        ]
      };

      const mockItemsChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: highStockItems, error: null })
      });

      const mockTransactionsChain = createMockChain({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation((field: string, id: string) => {
          return {
            data: highStockTransactions[id],
            error: null
          };
        })
      });

      mockSupabase.from.mockImplementation((table: string) => {
        return table === 'inventory_items' ? mockItemsChain : mockTransactionsChain;
      });

      const response = await request(app)
        .get('/api/inventory/alerts/low-stock')
        .set('user', JSON.stringify(testUser));

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });
});
