import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomerService } from '../services/customerService';
import { CustomerCreate, CustomerUpdate } from '../types/customer';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => CustomerService.getCustomers(),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => CustomerService.getCustomerById(id),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customer: CustomerCreate) => CustomerService.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdate }) => 
      CustomerService.updateCustomer(id, data),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({
        queryKey: ['customer', updatedCustomer.id],
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CustomerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}; 