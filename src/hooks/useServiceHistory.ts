import { useQuery } from '@tanstack/react-query';
import { ServiceHistoryService } from '../services/serviceHistoryService';

export const useServiceHistory = (customerId: string) => {
  const { data: serviceRecords, isLoading, error } = useQuery({
    queryKey: ['serviceHistory', customerId],
    queryFn: () => ServiceHistoryService.getCustomerServiceHistory(customerId),
  });

  return {
    serviceRecords,
    isLoading,
    error,
  };
};

export const useAllServiceHistory = () => {
  const { data: serviceRecords, isLoading, error } = useQuery({
    queryKey: ['serviceHistory', 'all'],
    queryFn: () => ServiceHistoryService.getServiceHistories(),
  });

  return {
    serviceRecords,
    isLoading,
    error,
  };
};