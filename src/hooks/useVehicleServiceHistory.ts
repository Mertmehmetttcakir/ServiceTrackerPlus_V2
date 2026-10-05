import { useQuery } from '@tanstack/react-query';
import { ServiceHistoryService } from '../services/serviceHistoryService';

export const useVehicleServiceHistory = (vehicleId: string) => {
  const { data: serviceHistory, isLoading } = useQuery({
    queryKey: ['vehicleServiceHistory', vehicleId],
    queryFn: () => ServiceHistoryService.getVehicleServiceHistory(vehicleId),
  });

  return {
    serviceHistory,
    isLoading,
  };
}; 