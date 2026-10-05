export interface RevenueFilterParams {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string; // ISO string for the target date (YYYY-MM-DD)
}
 
export interface TotalRevenue {
  total: number;
} 