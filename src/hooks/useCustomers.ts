import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QUERY_KEYS } from '../config/queryClient';
import { CustomerService } from '../services/customerService';
import { Customer, CustomerFilters, CustomerFormData } from '../types/customer';

export const useCustomers = (filters: CustomerFilters) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: customersData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.customers.all,
    queryFn: () => CustomerService.getCustomers(),
    staleTime: QUERY_KEYS.customers.staleTime,
  });

  const customers = useMemo(() => {
    if (!customersData) return [];

    let list = [...customersData];

    // Arama filtresi (isim, e-posta, telefon)
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((c) => {
        const name = c.full_name.toLowerCase();
        const email = (c.email || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
      });
    }

    // Sıralama
    list.sort((a, b) => {
      const { sortBy, sortOrder } = filters;
      const dir = sortOrder === 'asc' ? 1 : -1;

      if (sortBy === 'full_name') {
        return a.full_name.localeCompare(b.full_name) * dir;
      }

      if (sortBy === 'createdAt') {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return (da - db) * dir;
      }

      if (sortBy === 'lastAppointment') {
        const da = a.last_appointment_date ? new Date(a.last_appointment_date).getTime() : 0;
        const db = b.last_appointment_date ? new Date(b.last_appointment_date).getTime() : 0;
        return (da - db) * dir;
      }

      // totalAppointments için elimizde doğrudan alan olmadığı için şimdilik sıralama yapmıyoruz
      return 0;
    });

    // Not: status ve hasVehicle filtreleri için backend'den ek alanlar gerektiğinden
    // şimdilik client tarafında filtre uygulanmıyor.

    return list;
  }, [customersData, filters]);

  const { mutate: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: (customer: CustomerFormData) => CustomerService.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all });
      toast({
        title: 'Müşteri oluşturuldu',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Müşteri oluşturulamadı',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      CustomerService.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.detail(variables.id) });
      toast({
        title: 'Müşteri güncellendi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Müşteri güncellenemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => CustomerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all });
      toast({
        title: 'Müşteri silindi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Müşteri silinemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

export const useCustomerById = (
  customerId: string | undefined,
  options?: Omit<UseQueryOptions<Customer, Error, Customer, readonly unknown[]>, 'queryKey' | 'queryFn' | 'initialData'>
) => {
  return useQuery({
    queryKey: QUERY_KEYS.customers.detail(customerId || ''),
    queryFn: () => {
      if (!customerId) return Promise.reject(new Error('Müşteri ID gerekli'));
      return CustomerService.getCustomerById(customerId);
    },
    staleTime: QUERY_KEYS.customers.staleTime,
    enabled: !!customerId,
    ...options,
  });
};
