import { ServiceItem } from './appointment';
import { Customer } from './customer';
import { Vehicle } from './vehicle';

export type ServiceStatus = 'in-progress' | 'completed';

export interface ServiceHistory {
  id: string;
  customer_id: string;
  vehicle_id: string;
  service_date: string;
  service_type: string;
  description: string;
  cost: number;
  status: ServiceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
  services?: ServiceItem[];
  totalPrice?: number;
  vehicleInfo?: {
    brand: string;
    model: string;
    plate: string;
  };
  technicianNotes?: string;
}

export type ServiceHistoryCreate = Omit<ServiceHistory, 'id' | 'created_at' | 'updated_at' | 'customer' | 'vehicle'>;

export type ServiceHistoryUpdate = Partial<ServiceHistoryCreate>; 