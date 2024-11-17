import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'staff', 'volunteer']),
  organization_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
});

export const volunteerSchema = z.object({
  organization_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availability: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
});

export const clientSchema = z.object({
  organization_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().min(1),
  household_size: z.number().int().positive(),
  dietary_restrictions: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
});

export const inventoryItemSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().nonnegative(),
  unit: z.string().min(1),
  expiration_date: z.date().optional(),
  location: z.string().optional(),
  minimum_quantity: z.number().nonnegative().optional(),
});

export const inventoryTransactionSchema = z.object({
  organization_id: z.string().uuid(),
  item_id: z.string().uuid(),
  type: z.enum(['in', 'out']),
  quantity: z.number().positive(),
  date: z.date(),
  notes: z.string().optional(),
  created_by: z.string().uuid(),
});
