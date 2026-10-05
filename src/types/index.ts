export * from './customer';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'technician' | 'staff';
  permissions: string[];
}

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  isAvailable: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  skills: string[];
  rating: number;
  appointmentCount: number;
}

export interface Appointment {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleInfo: string;
  technicianId: string;
  technicianName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  totalAmount: number;
}

export interface FinancialRecord {
  id: string;
  customerId: string;
  serviceId: string;
  amount: number;
  type: 'payment' | 'refund';
  method: 'cash' | 'credit_card' | 'bank_transfer';
  date: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  lastService: string;
  customerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  notes?: string;
}

export interface Financial {
  id: string;
  date: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  appointmentId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: 'cash' | 'credit_card' | 'bank_transfer';
  notes?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
} 