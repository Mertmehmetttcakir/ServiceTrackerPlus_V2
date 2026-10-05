import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CustomerService } from '../services/customerService';
import { Customer } from '../types/customer';

export const useCustomer = (customerId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => CustomerService.getCustomerById(customerId),
  });

  const { mutate: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: (data: Partial<Customer>) => CustomerService.updateCustomer(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      toast({
        title: 'Müşteri güncellendi',
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

  const { mutate: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: () => CustomerService.deleteCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Müşteri silindi',
        status: 'success',
        duration: 3000,
      });
      navigate('/customers');
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

  return {
    customer,
    isLoading,
    error,
    updateCustomer,
    deleteCustomer,
    isUpdating,
    isDeleting,
  };
}; 