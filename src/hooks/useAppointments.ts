import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../config/queryClient';
import { AppointmentService } from '../services/appointmentService';
import { Appointment, AppointmentCreate, AppointmentFilters } from '../types/appointment';

export const useAppointments = (filters?: AppointmentFilters) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: appointments, isLoading } = useQuery({
    queryKey: QUERY_KEYS.appointments.list(filters || {}),
    queryFn: () => {
      if (filters?.status || filters?.customerId) {
        return AppointmentService.getFilteredAppointments(filters);
      }
      return AppointmentService.getRecentAppointments(50); // Sadece son 50 randevuyu getir
    },
    staleTime: QUERY_KEYS.appointments.staleTime,
    gcTime: 30 * 60 * 1000, // 30 dakika
  });

  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: (data: AppointmentCreate) => AppointmentService.createAppointmentWithConflictCheck(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all });
      queryClient.invalidateQueries({ queryKey: ['available-time-slots'] });
      toast({
        title: 'Randevu oluşturuldu',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Randevu oluşturulamadı',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: createRecurringAppointments, isPending: isCreatingRecurring } = useMutation({
    mutationFn: (data: AppointmentCreate) => AppointmentService.createRecurringAppointments(data),
    onSuccess: (data: Appointment[]) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all });
      queryClient.invalidateQueries({ queryKey: ['available-time-slots'] });
      toast({
        title: `${data.length} tekrarlayan randevu oluşturuldu`,
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Tekrarlayan randevular oluşturulamadı',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: updateAppointment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentCreate> }) =>
      AppointmentService.updateAppointmentWithConflictCheck(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['available-time-slots'] });
      toast({
        title: 'Randevu güncellendi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Randevu güncellenemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: deleteAppointment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => AppointmentService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments.all });
      queryClient.invalidateQueries({ queryKey: ['available-time-slots'] });
      toast({
        title: 'Randevu silindi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Randevu silinemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment,
    createRecurringAppointments,
    updateAppointment,
    deleteAppointment,
    isCreating,
    isCreatingRecurring,
    isUpdating,
    isDeleting,
  };
};

/**
 * Randevu çakışması kontrolü için hook
 */
export const useAppointmentConflictCheck = () => {
  const { mutate: checkConflict, isPending: isChecking, data: conflictResult } = useMutation({
    mutationFn: ({
      appointmentDate,
      startTime,
      endTime,
      excludeAppointmentId
    }: {
      appointmentDate: string;
      startTime: string;
      endTime: string;
      excludeAppointmentId?: string;
    }) => AppointmentService.checkAppointmentConflict(appointmentDate, startTime, endTime, excludeAppointmentId),
    onError: (error) => {
      console.error('Çakışma kontrolü hatası:', error);
    },
  });

  return {
    checkConflict,
    isChecking,
    conflictResult,
  };
};

/**
 * Uygun saat dilimlerini getirmek için hook
 */
export const useAvailableTimeSlots = (appointmentDate: string, duration: number = 60) => {
  const { data: timeSlots, isLoading: isLoadingSlots, error } = useQuery({
    queryKey: ['available-time-slots', appointmentDate, duration],
    queryFn: () => AppointmentService.getAvailableTimeSlots(appointmentDate, duration),
    enabled: !!appointmentDate,
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });

  return {
    timeSlots,
    isLoadingSlots,
    error,
    availableSlots: timeSlots?.availableSlots || [],
    busySlots: timeSlots?.busySlots || [],
  };
};
