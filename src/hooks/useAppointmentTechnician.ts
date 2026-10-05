import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppointmentService } from '../services/appointmentService';

interface AssignTechnicianParams {
  appointmentId: string;
  technicianId: string;
  notes?: string;
}

export const useAppointmentTechnician = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { mutateAsync: assignTechnician, isPending: isAssigning } = useMutation({
    mutationFn: ({ appointmentId, technicianId, notes }: AssignTechnicianParams) => {
      // Mevcut notları korurken teknisyen ID'sini ekle
      const updatedNotes = notes || '';
      const technicianNotes = updatedNotes.includes('technician_id:') 
        ? updatedNotes.replace(/technician_id:\w+/, `technician_id:${technicianId}`)
        : `${updatedNotes}\ntechnician_id:${technicianId}`.trim();
      
      return AppointmentService.updateAppointment(appointmentId, { 
        notes: technicianNotes 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Teknisyen atandı',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Teknisyen atanamadı',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  });

  return {
    assignTechnician,
    isAssigning
  };
}; 