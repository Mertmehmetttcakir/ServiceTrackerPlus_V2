import { Job } from '../types/job';
import { ServiceHistory } from '../types/serviceHistory';

export const mockJobs: Job[] = [
  {
    id: '1',
    appointment_id: '1',
    customer_id: '1',
    vehicle_id: '1',
    technician_id: '1',
    title: 'Motor Bakımı',
    description: 'Rutin motor bakımı ve yağ değişimi',
    status: 'in-progress',
    estimated_cost: 500,
    actual_cost: 450,
    labor_hours: 3,
    parts_cost: 200,
    start_date: '2024-03-20T09:00:00Z',
    end_date: '2024-03-20T12:00:00Z',
    notes: 'Motor yağı ve filtre değişimi tamamlandı',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    appointment_id: '2',
    customer_id: '2',
    vehicle_id: '2',
    technician_id: '2',
    title: 'Fren Sistemı Kontrolü',
    description: 'Fren balata ve disk kontrolü',
    status: 'completed',
    estimated_cost: 300,
    actual_cost: 280,
    labor_hours: 2,
    parts_cost: 150,
    start_date: '2024-03-19T14:00:00Z',
    end_date: '2024-03-19T16:00:00Z',
    notes: 'Fren balata değişimi yapıldı',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockServiceHistory: ServiceHistory[] = [
  {
    id: '1',
    vehicle_id: '1',
    customer_id: '1',
    service_date: '2024-03-20',
    service_type: 'Rutin Bakım',
    description: 'Motor yağı değişimi ve genel kontrol',
    cost: 450,
    mileage: 45000,
    technician: 'Ahmet Teknisyen',
    notes: 'Tüm kontroller normal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    vehicle_id: '2',
    customer_id: '2',
    service_date: '2024-03-19',
    service_type: 'Fren Bakımı',
    description: 'Fren balata değişimi',
    cost: 280,
    mileage: 75000,
    technician: 'Mehmet Teknisyen',
    notes: 'Fren performansı iyileştirildi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockCreateJob = (data: Partial<Job>): Job => ({
  id: Math.random().toString(36).substr(2, 9),
  appointment_id: '',
  customer_id: '',
  vehicle_id: '',
  technician_id: '',
  title: '',
  description: '',
  status: 'pending',
  estimated_cost: 0,
  actual_cost: 0,
  labor_hours: 0,
  parts_cost: 0,
  start_date: new Date().toISOString(),
  end_date: '',
  notes: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...data
});

export const mockCreateServiceHistory = (data: Partial<ServiceHistory>): ServiceHistory => ({
  id: Math.random().toString(36).substr(2, 9),
  vehicle_id: '',
  customer_id: '',
  service_date: new Date().toISOString().split('T')[0],
  service_type: '',
  description: '',
  cost: 0,
  mileage: 0,
  technician: '',
  notes: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...data
}); 