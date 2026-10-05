import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { Technician, TechnicianCreate, TechnicianFilters, TechnicianUpdate } from '../types/technician';

export const useTechnicians = (filters?: TechnicianFilters) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: technicians, isLoading, error } = useQuery<Technician[]>({
    queryKey: ['technicians', filters],
    queryFn: async () => {
      let query = supabase.from('technicians').select('*');

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters?.specialization) {
        query = query.contains('specialization', [filters.specialization]);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

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

  const { mutateAsync: addTechnician, isPending: isAdding } = useMutation<Technician, Error, TechnicianCreate>({
    mutationFn: async (newTechnician) => {
      const { data, error } = await supabase
        .from('technicians')
        .insert(newTechnician)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast({
        title: 'Teknisyen oluşturuldu',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutateAsync: updateTechnician, isPending: isUpdating } = useMutation<Technician, Error, { id: string; data: TechnicianUpdate }>({
    mutationFn: async ({ id, data }) => {
      const { data: updatedTechnician, error } = await supabase
        .from('technicians')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedTechnician;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast({
        title: 'Teknisyen güncellendi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutateAsync: deleteTechnician, isPending: isDeleting } = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast({
        title: 'Teknisyen silindi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const getTechnicianById = async (id: string) => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  };

  return {
    technicians,
    isLoading,
    error,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    getTechnicianById,
    isAdding,
    isUpdating,
    isDeleting,
  };
}; 