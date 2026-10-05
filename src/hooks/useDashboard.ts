import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '../config/queryClient';
import { DashboardService } from '../services/dashboardService';
import { RevenueFilterParams, TotalRevenue } from '../types/dashboard';

export const useTotalRevenue = (
  params?: RevenueFilterParams,
  options?: Omit<
    UseQueryOptions<
      TotalRevenue,
      Error,
      TotalRevenue,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  const queryKey = params 
    ? [...QUERY_KEYS.dashboard.stats, 'totalRevenue', params.period, params.date] 
    : [...QUERY_KEYS.dashboard.stats, 'totalRevenue', 'all'];

  return useQuery({
    queryKey,
    queryFn: () => DashboardService.getTotalRevenue(params),
    staleTime: QUERY_KEYS.dashboard.staleTime,
    refetchOnMount: true,
    ...options,
  });
};

/**
 * Dashboard için optimize edilmiş aylık gelir hook'u
 */
export const useMonthlyRevenue = (
  options?: Omit<
    UseQueryOptions<
      { totalRevenue: number; revenueGrowth: number },
      Error,
      { totalRevenue: number; revenueGrowth: number },
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboard.stats, 'monthlyRevenue'],
    queryFn: () => DashboardService.getMonthlyRevenue(),
    staleTime: QUERY_KEYS.dashboard.staleTime,
    gcTime: 1000 * 60 * 30, // 30 dakika
    refetchInterval: 1000 * 60 * 5, // 5 dakikada bir otomatik yenile
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
};
