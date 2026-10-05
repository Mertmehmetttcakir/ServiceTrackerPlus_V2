import { Technician } from '../types/technician';

export const mockTechnicians: Technician[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.teknisyen@example.com',
    phone: '5551234567',
    specialization: ['Motor', 'Şanzıman'],
    experience_years: 10,
    hourly_rate: 100,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Mehmet Demir',
    email: 'mehmet.teknisyen@example.com',
    phone: '5559876543',
    specialization: ['Fren', 'Süspansiyon'],
    experience_years: 8,
    hourly_rate: 90,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockCreateTechnician = (data: Partial<Technician>): Technician => ({
  id: Math.random().toString(36).substr(2, 9),
  name: '',
  email: '',
  phone: '',
  specialization: [],
  experience_years: 0,
  hourly_rate: 0,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...data
}); 