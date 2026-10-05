import { useQuery } from '@tanstack/react-query';
import { endOfMonth, parseISO, startOfMonth } from 'date-fns';
import { useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Appointment, AppointmentFilters } from '../types/appointment';

export const useAppointmentCalendar = (month: Date, filters?: AppointmentFilters) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { 
    data: appointments, 
    isLoading, 
    error 
  } = useQuery<Appointment[]>({
    queryKey: ['appointments', 'calendar', month, filters],
    queryFn: async () => {
      const start = startOfMonth(month).toISOString();
      const end = endOfMonth(month).toISOString();

      let query = supabase
        .from('appointments')
        .select('*, customer:customers(*), vehicle:vehicles(*), technician:technicians(*)')
        .gte('appointment_date', start)
        .lte('appointment_date', end);

      // Filtreleme
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.technicianId) {
        query = query.eq('technician_id', filters.technicianId);
      }

      // Sıralama
      if (filters?.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Tarihe göre randevuları gruplandır
  const appointmentsByDate = useMemo(() => {
    if (!appointments) return {};

    return appointments.reduce((acc, appointment) => {
      const date = parseISO(appointment.appointment_date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [appointments]);

  // Günlük randevuları getir
  const getDayAppointments = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointmentsByDate[dateString] || [];
  };

  return {
    appointments,
    appointmentsByDate,
    getDayAppointments,
    selectedDate,
    setSelectedDate,
    isLoading,
    error
  };
}; 