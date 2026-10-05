import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ServiceHistoryService } from '../services/serviceHistoryService';
import { ServiceStatus } from '../types/serviceHistory';

interface StatusUpdatePayload {
  status: ServiceStatus;
  notes?: string;
}

export const useServiceDetail = (serviceId: string) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => ServiceHistoryService.getServiceHistoryById(serviceId),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: (payload: StatusUpdatePayload) =>
      ServiceHistoryService.updateServiceHistory(serviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      setIsUpdating(false);
    },
    onError: () => {
      setIsUpdating(false);
    },
  });

  const handleStatusUpdate = async (payload: StatusUpdatePayload) => {
    setIsUpdating(true);
    updateStatus(payload);
  };

  return {
    service,
    isLoading,
    isUpdating,
    handleStatusUpdate,
  };
}; 