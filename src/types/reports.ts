export interface ReportFilters {
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  customerSegment?: 'VIP' | 'Premium' | 'Standard' | 'Basic';
}

export interface ReportMetrics {
  totalRevenue: number;
  totalAppointments: number;
  averageRating: number;
  completionRate: number;
  revenueGrowth: number;
  appointmentGrowth: number;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  paidAmount: number;
  pendingAmount: number;
  refundAmount: number;
  revenueGrowth: number;
  profitMargin: number;
  previousPeriodRevenue: number;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageCustomerValue: number;
  customerGrowth: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    jobCount: number;
  }>;
}

export interface ServiceReport {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  cancelledJobs: number;
  averageJobValue: number;
  averageCompletionTime: number;
  jobGrowth: number;
  popularServices: Array<{
    service: string;
    count: number;
    revenue: number;
  }>;
}

export interface TechnicianReport {
  totalTechnicians: number;
  activeTechnicians: number;
  workload: Array<{
    technicianId: string;
    name: string;
    completedJobs: number;
    totalRevenue: number;
    averageRating: number;
    efficiency: number;
  }>;
  productivity: {
    averageJobsPerDay: number;
    averageRevenuePerTechnician: number;
    totalWorkHours: number;
  };
}

export interface MonthlyComparisonData {
  current: {
    month: string;
    revenue: number;
    jobs: number;
    customers: number;
  };
  previous: {
    month: string;
    revenue: number;
    jobs: number;
    customers: number;
  };
  growth: {
    revenue: number;
    jobs: number;
    customers: number;
  };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface RevenueChartData {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

export type ReportExportFormat = 'excel' | 'pdf' | 'csv';

export interface ReportExportOptions {
  format: ReportExportFormat;
  includeCharts: boolean;
  dateRange: {
    start: string;
    end: string;
  };
} 