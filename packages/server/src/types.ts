import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Auth Types
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'staff' | 'volunteer';
    organization_id: string;
  };
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  website?: string;
}

export interface OrganizationStats {
  stats: {
    volunteers: number;
    clients: number;
    inventory: number;
  };
  recentActivity: InventoryTransaction[];
}

// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'volunteer';
  organization_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

// Volunteer Types
export interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  skills: string[];
  availability: VolunteerAvailability[];
  notes?: string;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface VolunteerAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
}

// Client Types
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address: string;
  household_size: number;
  status: 'active' | 'inactive';
  notes?: string;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClientVisit {
  id: string;
  client_id: string;
  visit_date: Date;
  notes?: string;
  served_by: string;
  organization_id: string;
  created_at: Date;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  sku?: string;
  barcode?: string;
  unit_type: string;
  minimum_stock: number;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryCategory {
  id: string;
  name: string;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: 'donation_in' | 'distribution_out';
  quantity: number;
  notes?: string;
  user_id: string;
  organization_id: string;
  transaction_date: Date;
  created_at: Date;
}

export interface InventoryItemWithStock extends InventoryItem {
  current_stock: number;
  category: InventoryCategory;
  recent_transactions?: InventoryTransaction[];
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
