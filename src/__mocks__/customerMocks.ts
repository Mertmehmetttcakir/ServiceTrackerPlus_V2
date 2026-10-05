import { Customer } from '../types/customer';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    full_name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '5551234567',
    address: 'İstanbul, Kadıköy',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    full_name: 'Fatma Demir',
    email: 'fatma@example.com',
    phone: '5559876543',
    address: 'Ankara, Çankaya',
    created_at: '2024-01-20T15:30:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
  {
    id: '3',
    full_name: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    phone: '5554567890',
    address: 'İzmir, Konak',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z',
  },
];

export const mockCustomerFormData = {
  full_name: 'Test Müşteri',
  email: 'test@example.com',
  phone: '5550000000',
  address: 'Test Adres',
}; 