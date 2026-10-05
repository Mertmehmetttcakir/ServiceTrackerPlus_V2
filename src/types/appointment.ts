import { Customer } from './customer';
import { Vehicle } from './vehicle';

export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'Beklemede'
  | 'İşlemde'
  | 'Tamamlandı'
  | 'Teslim Edildi'
  | 'Teslim Edilmedi'
  | 'İptal Edildi';
export type ServiceType = 'periodic' | 'repair' | 'inspection' | 'other';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurrencePattern {
  type: RecurrenceType;
  interval?: number; // Örneğin her 2 haftada bir için interval: 2, type: 'weekly'
  endDate?: string; // Tekrarlamanın biteceği tarih (YYYY-MM-DD)
  occurrences?: number; // Kaç kez tekrarlanacak
  weekdays?: number[]; // Haftanın hangi günleri (0-6, Pazar-Cumartesi)
  dayOfMonth?: number; // Ayın hangi günü (1-31)
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  estimatedDuration: number; // dakika cinsinden
  price: number;
}

export interface Appointment {
  id: string;
  customer_id: string;
  vehicle_id: string;
  appointment_date: string;
  status: AppointmentStatus;
  service_type: ServiceType;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
  date?: string;
  timeSlot?: {
    start: string;
    end: string;
  };
  serviceType?: ServiceType;
  technician?: {
    id: string;
    name: string;
  };
  totalPrice?: number;
  total_cost?: number;
  amount_paid?: number;
  remaining_balance?: number;
}

export type AppointmentCreate = Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'customer' | 'vehicle' | 'total_cost' | 'amount_paid' | 'remaining_balance'> & {
  recurrencePattern?: RecurrencePattern;
};

export type AppointmentUpdate = Partial<AppointmentCreate>;

export interface AppointmentFormData {
  customerId: string;
  vehicleId: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  serviceType: ServiceType;
  services: Omit<ServiceItem, 'id'>[];
  technicianId?: string;
  notes?: string;
  status?: AppointmentStatus;
  recurrencePattern?: RecurrencePattern; // Tekrarlama bilgileri
}

export interface AppointmentFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
  technicianId?: string;
  customerId?: string;
  serviceType?: ServiceType;
  recurrenceId?: string; // Tekrarlayan randevu serisi filtresi
  sortBy?: 'date' | 'status' | 'customerName';
  sortOrder?: 'asc' | 'desc';
} 