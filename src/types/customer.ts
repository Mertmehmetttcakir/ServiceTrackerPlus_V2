import { Appointment } from './appointment';
import { Job } from './job';
import { Vehicle } from './vehicle';

export interface Customer {
  id: string;
  user_id?: string | null;
  created_by_admin_id?: string | null;
  full_name: string;
  name?: string; // Legacy API alanları için opsiyonel destek
  email?: string | null;
  phone: string;
  address?: string;
  vehicles?: Vehicle[];
  appointments?: Appointment[];
  jobs?: Job[];
  created_at: string;
  updated_at: string;
  last_appointment_date?: string | null;
  total_outstanding_balance_from_jobs?: number | null;
}

export type CustomerCreate = Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'vehicles' | 'appointments' | 'jobs' | 'last_appointment_date' | 'total_outstanding_balance_from_jobs'>;

export type CustomerUpdate = Partial<CustomerCreate>;

export interface CustomerFilters {
  search?: string;
  sortBy: 'full_name' | 'createdAt' | 'lastAppointment' | 'totalAppointments';
  sortOrder: 'asc' | 'desc';
  status?: 'active' | 'inactive';
  hasVehicle?: boolean;
  page?: number;
  limit?: number;
}

export interface CustomerResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface ServiceRecord {
  id: string;
  customerId: string;
  vehicleId: string;
  date: string;
  serviceType: string;
  description: string;
  cost: number;
  paid: number;
  status: ServiceStatus;
  technicianId?: string;
}

export type ServiceStatus = 'pending' | 'in-progress' | 'completed'; 

export interface CustomerFormData extends CustomerCreate {
}

export interface ServiceHistory {
  id: string;
  customerId: string;
  vehicleId: string;
  date?: string;
  status: ServiceStatus;
  vehicleInfo?: {
    brand: string;
    model: string;
    plate: string;
  };
  services?: Array<{
    id: string;
    name: string;
    description?: string;
    price?: number;
  }>;
  totalPrice?: number;
  technicianNotes?: string;
} 