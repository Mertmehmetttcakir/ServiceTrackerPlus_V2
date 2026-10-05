import { Technician, TechnicianAvailability } from '../types/technician';
import { api } from './api';

class TechnicianService {
  async getTechnicians(): Promise<Technician[]> {
    const response = await api.get<Technician[]>('/technicians');
    return response.data;
  }

  async getTechnician(id: string): Promise<Technician> {
    const response = await api.get<Technician>(`/technicians/${id}`);
    return response.data;
  }

  async createTechnician(data: Omit<Technician, 'id'>): Promise<Technician> {
    const response = await api.post<Technician>('/technicians', data);
    return response.data;
  }

  async updateTechnician(id: string, data: Partial<Technician>): Promise<Technician> {
    const response = await api.patch<Technician>(`/technicians/${id}`, data);
    return response.data;
  }

  async deleteTechnician(id: string): Promise<void> {
    await api.delete(`/technicians/${id}`);
  }

  async getTechnicianAvailability(technicianId: string, date: string): Promise<TechnicianAvailability> {
    const response = await api.get<TechnicianAvailability>(`/technicians/${technicianId}/availability`, {
      params: { date }
    });
    return response.data;
  }
  
  async assignTechnician(appointmentId: string, technicianId: string): Promise<void> {
    await api.post(`/appointments/${appointmentId}/technician`, { technicianId });
  }
}

export const technicianService = new TechnicianService(); 