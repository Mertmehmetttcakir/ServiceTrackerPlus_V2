import { QueryClient } from '@tanstack/react-query';

// Cache temizleme utility fonksiyonları
export const clearAllCache = (queryClient: QueryClient) => {
  queryClient.clear();
};

export const clearCustomerCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['customers'] });
  queryClient.removeQueries({ queryKey: ['customers'] });
};

export const clearVehicleCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  queryClient.removeQueries({ queryKey: ['vehicles'] });
};

export const clearAppointmentCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['appointments'] });
  queryClient.removeQueries({ queryKey: ['appointments'] });
};

export const clearJobCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['jobs'] });
  queryClient.removeQueries({ queryKey: ['jobs'] });
};

export const clearFinancialCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['financialTransactions'] });
  queryClient.removeQueries({ queryKey: ['financialTransactions'] });
};

export const clearDashboardCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.removeQueries({ queryKey: ['dashboard'] });
};

// Kullanıcı değiştiğinde tüm cache'i temizle
export const clearCacheOnUserChange = (queryClient: QueryClient) => {
  clearAllCache(queryClient);
}; 