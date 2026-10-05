import { supabase } from '../lib/supabase';
import { HttpError } from '../errors/HttpError';
import { RevenueFilterParams, TotalRevenue } from '../types/dashboard';
import { logger } from '../utils/logger';
import { BaseApiService } from './baseApiService';
import { ErrorLogger } from './errorLogger';

export class DashboardService extends BaseApiService {
  /**
   * Dashboard için optimize edilmiş aylık gelir verisi
   */
  static async getMonthlyRevenue(): Promise<{ totalRevenue: number; revenueGrowth: number }> {
    const errorMessage = 'Aylık gelir verisi getirilemedi';
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];
      
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

      // Paralel sorgu - bu ay ve geçen ay (NET gelir: ödeme - iade)
      const [thisMonthResult, lastMonthResult] = await Promise.all([
        // Bu ay: paid_jobs_revenue view'ından net ciro (PAYMENT - REFUND)
        supabase
          .from('paid_jobs_revenue')
          .select('paid_amount')
          .eq('customer_user_id', user.id)
          .gte('transaction_date', thisMonthStart)
          .lt('transaction_date', nextMonthStart),
        
        // Geçen ay
        supabase
          .from('paid_jobs_revenue')
          .select('paid_amount')
          .eq('customer_user_id', user.id)
          .gte('transaction_date', lastMonthStart)
          .lt('transaction_date', thisMonthStart)
      ]);

      const thisMonthRevenue =
        thisMonthResult.data?.reduce((acc, row: { paid_amount: number | null }) => acc + (row.paid_amount || 0), 0) ?? 0;

      const lastMonthRevenue =
        lastMonthResult.data?.reduce((acc, row: { paid_amount: number | null }) => acc + (row.paid_amount || 0), 0) ?? 0;

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : thisMonthRevenue > 0 ? 100 : 0;

      const result = {
        totalRevenue: thisMonthRevenue,
        revenueGrowth
      };

      logger.info('Aylık gelir verisi hesaplandı', {
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth,
      });

      return result;

    } catch (error) {
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      logger.error('Aylık gelir hatası', errorToLog, { originalErrorMessage: errorMessage });

      if (errorToLog instanceof HttpError) {
        throw errorToLog;
      }

      await ErrorLogger.logError(errorToLog, { originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  static async getTotalRevenue(params?: RevenueFilterParams): Promise<TotalRevenue> {
    const errorMessage = 'Toplam ciro getirilemedi';
    try {
      // Mevcut kullanıcının ID'sini al
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      let query = supabase.from('paid_jobs_revenue').select('paid_amount')
        .eq('customer_user_id', user.id); // Sadece giriş yapan kullanıcının müşterilerinin cirolarını getir

      if (params) {
        const targetDate = new Date(params.date);
        if (params.period === 'daily') {
          query = query.eq('payment_day_ts', params.date);
        } else if (params.period === 'weekly') {
          const dForIsoYear = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
          dForIsoYear.setUTCDate(dForIsoYear.getUTCDate() + 4 - (dForIsoYear.getUTCDay() || 7));
          const isoYear = dForIsoYear.getUTCFullYear();

          const weekString = await this.getWeekOfYear(targetDate);
          const week = parseInt(weekString, 10);
          
          if (isNaN(week)) {
            console.warn(`Geçersiz hafta hesaplandı: ${params.date}, hafta: ${weekString}`);
            await ErrorLogger.logError(new Error('Geçersiz hafta hesaplandı'), { date: params.date, calculatedWeek: weekString });
          }
          query = query.eq('payment_isoyear_num', isoYear).eq('payment_week_num', week);
        } else if (params.period === 'monthly') {
          const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0];
          query = query.eq('payment_month_ts', firstDayOfMonth);
        } else if (params.period === 'yearly') {
          const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1).toISOString().split('T')[0];
          query = query.eq('payment_year_ts', firstDayOfYear);
        }
      }

      const { data, error } = await query;

      if (error) {
        const statusCode = typeof error.code === 'string' ? parseInt(error.code, 10) : error.code || 500;
        await ErrorLogger.logApiError(errorMessage, statusCode, error, { params });
        throw new HttpError(error.message || errorMessage, statusCode);
      }

      const revenueData = data as { paid_amount: number | null }[] | null;
      const total = revenueData?.reduce((acc, item) => acc + (item.paid_amount || 0), 0) || 0;
      return { total };

    } catch (error) {
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      logger.error('Toplam ciro hatası', errorToLog, { params, originalErrorMessage: errorMessage });

      if (errorToLog instanceof HttpError) {
        throw errorToLog;
      }

      await ErrorLogger.logError(errorToLog, { params, originalErrorMessage: errorMessage }); 
      throw new HttpError(errorMessage, 500);
    }
  }

  private static async getWeekOfYear(date: Date): Promise<string> {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7).toString();
  }
} 