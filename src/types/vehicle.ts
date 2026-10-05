import { Customer } from './customer';
import { ServiceHistory } from './serviceHistory';

export interface Vehicle {
  id: string;
  customer_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  serviceHistory?: ServiceHistory[];
  status?: 'active' | 'inactive';
  vin?: string;
  notes?: string;
}

export type VehicleCreate = Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'customer' | 'serviceHistory'>;

export type VehicleUpdate = Partial<Omit<VehicleCreate, 'customer_id'>>;

export interface VehicleFormData extends VehicleCreate {
  status?: 'active' | 'inactive';
} 