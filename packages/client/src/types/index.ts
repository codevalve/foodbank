export interface InventoryItem {
  id: string;
  name: string;
  category_id: string;
  organization_id: string;
  minimum_stock: number;
  unit: string;
  location: string;
  notes?: string;
  current_stock: number;
  category: {
    id: string;
    name: string;
    organization_id: string;
  };
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
