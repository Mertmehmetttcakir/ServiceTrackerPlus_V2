import { ServiceItem } from './appointment';

export type ServiceStatus = 'in-progress' | 'completed';

export interface ServiceRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleId: string;
  vehicleInfo: {
    brand: string;
    model: string;
    plate: string;
    year: number;
  };
  date: string;
  technicianId: string;
  technicianName: string;
  technicianNotes?: string;
  services: ServiceItem[];
  totalPrice: number;
  status: ServiceStatus;
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdAt: string;
  updatedAt: string;
} 