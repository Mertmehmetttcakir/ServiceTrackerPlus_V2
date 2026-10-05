import { Appointment } from '../types/appointment';

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    customer_id: '1',
    vehicle_id: '1',
    appointment_date: '2024-03-20T10:00:00Z',
    status: 'confirmed',
    service_type: 'periodic',
    notes: 'Müşteri sabah saatlerini tercih ediyor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    customer_id: '2',
    vehicle_id: '2',
    appointment_date: '2024-03-21T14:00:00Z',
    status: 'in-progress',
    service_type: 'repair',
    notes: 'Acil durum',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockCreateAppointment = (data: Partial<Appointment>): Appointment => ({
  id: Math.random().toString(36).substr(2, 9),
  customer_id: '',
  vehicle_id: '',
  appointment_date: new Date().toISOString(),
  status: 'pending',
  service_type: 'periodic',
  notes: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...data
}); 