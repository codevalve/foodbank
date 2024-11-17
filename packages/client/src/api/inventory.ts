import axios from 'axios';
import { InventoryItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

interface FetchInventoryOptions {
  lowStockOnly?: boolean;
}

export async function fetchInventoryItems({ lowStockOnly = false }: FetchInventoryOptions = {}) {
  const endpoint = lowStockOnly ? '/api/inventory/low-stock' : '/api/inventory';
  const response = await api.get<InventoryItem[]>(endpoint);
  return response.data;
}

export async function createInventoryItem(data: Omit<InventoryItem, 'id' | 'updated_at'>) {
  const response = await api.post<InventoryItem>('/api/inventory', data);
  return response.data;
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>) {
  const response = await api.patch<InventoryItem>(`/api/inventory/${id}`, data);
  return response.data;
}

export async function deleteInventoryItem(id: string) {
  await api.delete(`/api/inventory/${id}`);
}

// For development/testing
export const mockInventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Canned Soup',
    category: { id: '1', name: 'Canned Goods' },
    location: 'Shelf A1',
    current_stock: 50,
    minimum_stock: 20,
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Rice',
    category: { id: '2', name: 'Grains' },
    location: 'Shelf B2',
    current_stock: 15,
    minimum_stock: 30,
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Pasta',
    category: { id: '2', name: 'Grains' },
    location: 'Shelf B3',
    current_stock: 45,
    minimum_stock: 25,
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Canned Vegetables',
    category: { id: '1', name: 'Canned Goods' },
    location: 'Shelf A2',
    current_stock: 10,
    minimum_stock: 40,
    updated_at: new Date().toISOString(),
  },
];
