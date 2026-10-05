import { Vehicle } from '../types/vehicle';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    customer_id: '1',
    brand: 'BMW',
    model: 'X5',
    year: 2020,
    plate: '34ABC123',
    vin: 'WBXHU7C30FA123456',
    notes: 'Düzenli bakım geçmişi var',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    customer_id: '2',
    brand: 'Mercedes',
    model: 'C-Class',
    year: 2019,
    plate: '06XYZ789',
    vin: 'WDD2050291F123456',
    notes: 'Son serviste fren balata değişimi yapıldı',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockCreateVehicle = (data: Partial<Vehicle>): Vehicle => ({
  id: Math.random().toString(36).substr(2, 9),
  customer_id: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  vin: '',
  notes: '',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...data
}); 