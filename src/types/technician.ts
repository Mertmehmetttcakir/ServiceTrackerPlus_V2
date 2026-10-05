export type TechnicianSpecialty = 'general' | 'engine' | 'electrical' | 'body';

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string[];
  isAvailable?: boolean;
  status: 'active' | 'inactive';
  hireDate: string;
  rating?: number;
  totalCompletedServices?: number;
  availableDays?: string[];
  workHoursStart?: string;
  workHoursEnd?: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicianCreate extends Omit<Technician, 'id' | 'created_at' | 'updated_at'> {}

export interface TechnicianUpdate extends Partial<TechnicianCreate> {}

export interface TechnicianFilters {
  search?: string;
  specialization?: string;
  status?: 'active' | 'inactive';
  minRating?: number;
  sortBy?: 'name' | 'rating' | 'totalCompletedServices';
  sortOrder?: 'asc' | 'desc';
}

export interface TechnicianAvailability {
  technicianId: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    isAvailable: boolean;
  }[];
} 