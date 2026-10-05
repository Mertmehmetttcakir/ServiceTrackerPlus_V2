import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ReportsService } from '../services/reportsService';
import {
  CustomerReport,
  FinancialReport,
  ReportExportOptions,
  ReportFilters,
  RevenueChartData,
  ServiceReport,
  TechnicianReport
} from '../types/reports';

const REPORTS_QUERY_KEY_PREFIX = 'reports';

/**
 * Finansal rapor verilerini getirir
 */
export const useFinancialReport = (
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<FinancialReport, Error, FinancialReport, (string | undefined)[]>, 'queryKey' | 'queryFn'>
) => {
  const queryKey = [REPORTS_QUERY_KEY_PREFIX, 'financial', filters.dateRange?.start, filters.dateRange?.end, filters.period, filters.customerId];

  const result = useQuery<FinancialReport, Error, FinancialReport, (string | undefined)[]>({
    queryKey,
    queryFn: () => {
      return ReportsService.getFinancialReport(filters);
    },
    staleTime: 2 * 60 * 1000, // 2 dakika (daha sık güncelleme)
    gcTime: 60 * 60 * 1000, // 1 saat (daha uzun cache)
    // Hızlı başlangıç için cached data varsa onu göster, background'da yenile
    refetchOnMount: 'always',
    refetchOnWindowFocus: false, // Gereksiz yenilemeleri engelle
    refetchInterval: 3 * 60 * 1000, // 3 dakikada bir otomatik yenile
    ...options,
  });

  return result;
};

/**
 * Müşteri rapor verilerini getirir
 */
export const useCustomerReport = (
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<CustomerReport, Error, CustomerReport, (string | undefined)[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CustomerReport, Error, CustomerReport, (string | undefined)[]>({
    queryKey: [REPORTS_QUERY_KEY_PREFIX, 'customer', filters.dateRange?.start, filters.dateRange?.end, filters.period, filters.customerId],
    queryFn: () => ReportsService.getCustomerReport(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
    ...options,
  });
};

/**
 * Servis rapor verilerini getirir
 */
export const useServiceReport = (
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<ServiceReport, Error, ServiceReport, (string | undefined)[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ServiceReport, Error, ServiceReport, (string | undefined)[]>({
    queryKey: [REPORTS_QUERY_KEY_PREFIX, 'service', filters.dateRange?.start, filters.dateRange?.end, filters.period, filters.customerId],
    queryFn: () => ReportsService.getServiceReport(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
    ...options,
  });
};

/**
 * Teknisyen rapor verilerini getirir
 */
export const useTechnicianReport = (
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<TechnicianReport, Error, TechnicianReport, (string | undefined)[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TechnicianReport, Error, TechnicianReport, (string | undefined)[]>({
    queryKey: [REPORTS_QUERY_KEY_PREFIX, 'technician', filters.dateRange?.start, filters.dateRange?.end, filters.period, filters.customerId],
    queryFn: () => ReportsService.getTechnicianReport(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
    ...options,
  });
};

/**
 * Gelir chart verilerini getirir
 */
export const useRevenueChartData = (
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<RevenueChartData, Error, RevenueChartData, (string | undefined)[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<RevenueChartData, Error, RevenueChartData, (string | undefined)[]>({
    queryKey: ['reports', 'revenue-chart', filters.dateRange?.start, filters.dateRange?.end, filters.customerId],
    queryFn: () => ReportsService.getRevenueChartData(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
    ...options,
  });
};

/**
 * Müşteri iş verilerini getirir
 */
export const useCustomerJobsData = (
  customerId: string | undefined,
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<any[], Error, any[], (string | undefined)[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any[], Error, any[], (string | undefined)[]>({
    queryKey: ['reports', 'customer-jobs', customerId, filters.dateRange?.start, filters.dateRange?.end],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return ReportsService.getCustomerJobsData(customerId, filters);
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 dakika
    ...options,
  });
};

/**
 * Rapor export işlemleri için mutation hook
 */
export const useReportExport = () => {
  return useMutation({
    mutationFn: ({
      type,
      filters,
      options
    }: {
      type: 'financial' | 'customer' | 'service' | 'technician';
      filters: ReportFilters;
      options: ReportExportOptions;
    }) => ReportsService.exportReport(type, filters, options),
    onSuccess: (blob, variables) => {
      // Dosyayı otomatik olarak indir
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${variables.type}-raporu-${new Date().toISOString().split('T')[0]}.${variables.options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
};

/**
 * Tüm raporları yeniden yükler
 */
export const useRefreshReports = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY_PREFIX] });
  };
}; 