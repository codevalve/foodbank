import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  role: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Volunteer {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills?: string[];
  availability?: string[];
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address: string;
  household_size: number;
  dietary_restrictions?: string[];
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface InventoryItem {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date?: Date;
  location?: string;
  minimum_quantity?: number;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryTransaction {
  id: string;
  organization_id: string;
  item_id: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
