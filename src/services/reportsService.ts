import { HttpError } from '../errors/HttpError';
import { supabase } from '../lib/supabase';
import {
  CustomerReport,
  FinancialReport,
  ReportExportOptions,
  ReportFilters,
  RevenueChartData,
  ServiceReport,
  TechnicianReport
} from '../types/reports';
import { BaseApiService } from './baseApiService';
import { ErrorLogger } from './errorLogger';

export class ReportsService extends BaseApiService {
  /**
   * Finansal rapor verilerini getirir - Optimize edilmiş versiyon
   */
  static async getFinancialReport(filters: ReportFilters): Promise<FinancialReport> {
    const errorMessage = 'Finansal rapor getirilemedi';
    try {
      // Geliştirme sırasında ayrıntılı debug için kullanılabilir.
      if (process.env.NODE_ENV === 'development') {
        console.log('=== OPTIMIZED FINANCIAL REPORT START ===');
        console.log('Filters:', filters);
      }
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User auth error:', userError);
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('User authenticated:', user.id);
      }

      // Tarih aralığını belirle
      const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = filters.dateRange?.end || new Date().toISOString();

      // Paralel sorgular için Promise.all kullan
      const [currentJobsResult, paymentsResult, refundsResult] = await Promise.all([
        // Mevcut dönem işleri - müşteri filtresi dahil
        (async () => {
          let currentJobsQuery = supabase
            .from('jobs')
            .select(`
              id, 
              total_cost, 
              customer_id,
              customers!inner(user_id)
            `)
            .gte('job_date', startDate)
            .lte('job_date', endDate)
            .eq('customers.user_id', user.id);

          if (filters.customerId) {
            currentJobsQuery = currentJobsQuery.eq('customer_id', filters.customerId);
          }

          return currentJobsQuery;
        })(),
        
        // Ödemeler - user filtresi dahil
        (async () => {
          let paymentsQuery = supabase
            .from('financial_transactions')
            .select(`
              amount, 
              job_id,
              customers!inner(user_id)
            `)
            .eq('transaction_type', 'PAYMENT')
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate)
            .eq('customers.user_id', user.id);

          if (filters.customerId) {
            paymentsQuery = paymentsQuery.eq('customer_id', filters.customerId);
          }

          return paymentsQuery;
        })(),
        
        // İadeler - user filtresi dahil
        (async () => {
          let refundsQuery = supabase
            .from('financial_transactions')
            .select(`
              amount,
              customers!inner(user_id)
            `)
            .eq('transaction_type', 'REFUND')
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate)
            .eq('customers.user_id', user.id);

          if (filters.customerId) {
            refundsQuery = refundsQuery.eq('customer_id', filters.customerId);
          }

          return refundsQuery;
        })()
      ]);

      // Hata kontrolü
      if (currentJobsResult.error) {
        console.error('Jobs sorgu hatası:', currentJobsResult.error);
        throw new Error(`İş verileri alınamadı: ${currentJobsResult.error.message}`);
      }

      if (paymentsResult.error) {
        console.error('Payments sorgu hatası:', paymentsResult.error);
        throw new Error(`Ödeme verileri alınamadı: ${paymentsResult.error.message}`);
      }

      if (refundsResult.error) {
        console.error('Refunds sorgu hatası:', refundsResult.error);
        // İade verisi kritik değil, devam et
      }

      const currentJobs = currentJobsResult.data || [];
      const payments = paymentsResult.data || [];
      const refunds = refundsResult.data || [];

      // Hızlı hesaplamalar
      const totalRevenuePotential = currentJobs.reduce((acc, job) => acc + (job.total_cost || 0), 0);
      const totalRevenue = payments.reduce((acc, payment) => acc + (payment.amount || 0), 0);
      const refundAmount = refunds.reduce((acc, refund) => acc + (refund.amount || 0), 0);

      // Bekleyen ödemeler hesapla (optimize edilmiş)
      const jobPayments = new Map<string, number>();
      payments.forEach(payment => {
        if (payment.job_id) {
          jobPayments.set(payment.job_id, (jobPayments.get(payment.job_id) || 0) + (payment.amount || 0));
        }
      });

      let pendingAmount = 0;
      currentJobs.forEach(job => {
        const paidForJob = jobPayments.get(job.id) || 0;
        const remaining = (job.total_cost || 0) - paidForJob;
        if (remaining > 0) {
          pendingAmount += remaining;
        }
      });

      // Önceki dönem karşılaştırması için basit hesaplama (önceki ay)
      const previousMonthStart = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() - 1, 1).toISOString();
      const previousMonthEnd = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth(), 0).toISOString();

      // Önceki dönem sadece ihtiyaç varsa hesapla
      let previousPeriodRevenue = 0;
      let revenueGrowth = 0;

      try {
        const { data: previousPayments } = await supabase
          .from('financial_transactions')
          .select(`
            amount,
            customers!inner(user_id)
          `)
          .eq('transaction_type', 'PAYMENT')
          .gte('transaction_date', previousMonthStart)
          .lte('transaction_date', previousMonthEnd)
          .eq('customers.user_id', user.id);

        previousPeriodRevenue = previousPayments?.reduce((acc, payment) => acc + (payment.amount || 0), 0) || 0;
        revenueGrowth = previousPeriodRevenue > 0 
          ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
          : totalRevenue > 0 ? 100 : 0;
      } catch (prevError) {
        console.warn('Önceki dönem verileri alınamadı:', prevError);
        // Hata durumunda varsayılan değerler kullan
      }

      const netProfit = totalRevenue - refundAmount;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const result = {
        totalRevenue,
        totalExpenses: refundAmount,
        netProfit,
        paidAmount: totalRevenue,
        pendingAmount,
        refundAmount,
        revenueGrowth,
        profitMargin,
        previousPeriodRevenue
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('=== OPTIMIZED FINANCIAL REPORT RESULT ===');
        console.log('Result:', result);
        console.log('Execution time optimized');
      }

      return result;

    } catch (error) {
      console.error('Finansal rapor hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Müşteri rapor verilerini getirir
   */
  static async getCustomerReport(filters: ReportFilters): Promise<CustomerReport> {
    const errorMessage = 'Müşteri raporu getirilemedi';
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // Tarih aralığını belirle
      const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = filters.dateRange?.end || new Date().toISOString();

      if (filters.customerId) {
        // Belirli bir müşteri için rapor
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', filters.customerId)
          .single();

        if (customerError || !customer) {
          throw new Error('Müşteri bulunamadı');
        }

        // Bu müşterinin iş sayısı
        const { data: jobs, count: jobCount, error: jobsError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .eq('customer_id', filters.customerId)
          .gte('job_date', startDate)
          .lte('job_date', endDate);

        if (jobsError) {
          console.error('Müşteri işleri sorgu hatası:', jobsError);
        }

        // Bu müşterinin toplam harcaması
        const totalSpent = jobs?.reduce((acc, job) => acc + (job.total_cost || 0), 0) || 0;

        return {
          totalCustomers: 1,
          newCustomers: 0,
          returningCustomers: 1,
          customerRetentionRate: 100,
          averageCustomerValue: totalSpent,
          customerGrowth: 0,
          topCustomers: [{
            id: customer.id,
            name: customer.full_name,
            totalSpent: totalSpent,
            jobCount: jobCount || 0
          }]
        };
      } else {
        // Tüm müşteriler için rapor
        // Toplam müşteri sayısı
        const { data: totalCustomers, count: totalCustomerCount, error: customersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        if (customersError) {
          console.error('Müşteriler sorgu hatası:', customersError);
        }

        // Yeni müşteriler (seçili dönemde)
        const { data: newCustomers, count: newCustomerCount, error: newCustomersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        if (newCustomersError) {
          console.error('Yeni müşteriler sorgu hatası:', newCustomersError);
        }

        // En çok iş yaptıran müşteriler - jobs tablosundan hesapla
        const { data: allJobs, error: allJobsError } = await supabase
          .from('jobs')
          .select('customer_id, total_cost, customers(id, full_name)')
          .gte('job_date', startDate)
          .lte('job_date', endDate);

        if (allJobsError) {
          console.error('Tüm işler sorgu hatası:', allJobsError);
        }

        // User'ın müşterilerini filtrele
        const userCustomerIds = new Set(totalCustomers?.map(c => c.id) || []);
        const filteredJobs = allJobs?.filter(job => userCustomerIds.has(job.customer_id)) || [];

        // Müşteri bazında toplam harcama hesapla
        const customerSpending = new Map<string, { name: string; totalSpent: number; jobCount: number }>();
        
        filteredJobs.forEach(job => {
          const customerId = job.customer_id;
          const customerName = (job.customers as any)?.full_name || 'Bilinmeyen';
          
          if (!customerSpending.has(customerId)) {
            customerSpending.set(customerId, {
              name: customerName,
              totalSpent: 0,
              jobCount: 0
            });
          }
          
          const customerData = customerSpending.get(customerId)!;
          customerData.totalSpent += job.total_cost || 0;
          customerData.jobCount += 1;
        });

        const topCustomers = Array.from(customerSpending.entries())
          .map(([id, data]) => ({
            id,
            name: data.name,
            totalSpent: data.totalSpent,
            jobCount: data.jobCount
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10);

        const averageCustomerValue = topCustomers.length > 0 
          ? topCustomers.reduce((acc, customer) => acc + customer.totalSpent, 0) / topCustomers.length 
          : 0;

        return {
          totalCustomers: totalCustomerCount || 0,
          newCustomers: newCustomerCount || 0,
          returningCustomers: (totalCustomerCount || 0) - (newCustomerCount || 0),
          customerRetentionRate: totalCustomerCount && totalCustomerCount > 0 ? 
            (((totalCustomerCount - (newCustomerCount || 0)) / totalCustomerCount) * 100) : 0,
          averageCustomerValue,
          customerGrowth: 0, // Bu hesaplama için önceki dönem verisi gerekli
          topCustomers
        };
      }

    } catch (error) {
      console.error('Müşteri raporu hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Servis rapor verilerini getirir
   */
  static async getServiceReport(filters: ReportFilters): Promise<ServiceReport> {
    const errorMessage = 'Servis raporu getirilemedi';
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // Tarih aralığını belirle
      const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = filters.dateRange?.end || new Date().toISOString();

      // İş istatistikleri
      let jobsQuery = supabase
        .from('jobs')
        .select('id, status, total_cost, job_description')
        .gte('job_date', startDate)
        .lte('job_date', endDate);

      if (filters.customerId) {
        jobsQuery = jobsQuery.eq('customer_id', filters.customerId);
      } else {
        // User'ın müşterilerinin işlerini getir
        const { data: userCustomers } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id);
        
        if (userCustomers && userCustomers.length > 0) {
          const customerIds = userCustomers.map(c => c.id);
          jobsQuery = jobsQuery.in('customer_id', customerIds);
        } else {
          // Hiç müşteri yoksa boş sonuç döndür
          return {
            totalJobs: 0,
            completedJobs: 0,
            pendingJobs: 0,
            cancelledJobs: 0,
            averageJobValue: 0,
            averageCompletionTime: 0,
            jobGrowth: 0,
            popularServices: []
          };
        }
      }

      const { data: jobs, error: jobsError } = await jobsQuery;

      if (jobsError) {
        console.error('Servis işleri sorgu hatası:', jobsError);
        throw new Error(`Servis verileri alınamadı: ${jobsError.message}`);
      }

      const totalJobs = jobs?.length || 0;
      const completedJobs = jobs?.filter(job => job.status === 'Tamamen Ödendi').length || 0;
      const pendingJobs = jobs?.filter(job => job.status === 'Açık' || job.status === 'Tamamlandı - Ödeme Bekliyor').length || 0;
      const cancelledJobs = jobs?.filter(job => job.status === 'İptal Edildi').length || 0;
      
      const averageJobValue = jobs && jobs.length > 0 ? 
        jobs.reduce((acc, job) => acc + (job.total_cost || 0), 0) / jobs.length : 0;

      // Popüler servisler analizi
      const serviceCount: Record<string, { count: number; revenue: number }> = {};
      jobs?.forEach(job => {
        const service = job.job_description || 'Belirtilmemiş';
        if (!serviceCount[service]) {
          serviceCount[service] = { count: 0, revenue: 0 };
        }
        serviceCount[service].count++;
        serviceCount[service].revenue += job.total_cost || 0;
      });

      const popularServices = Object.entries(serviceCount)
        .map(([service, data]) => ({ service, count: data.count, revenue: data.revenue }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalJobs,
        completedJobs,
        pendingJobs,
        cancelledJobs,
        averageJobValue,
        averageCompletionTime: 0, // Bu veri için ek hesaplama gerekli
        jobGrowth: 0, // Bu hesaplama için önceki dönem verisi gerekli
        popularServices
      };

    } catch (error) {
      console.error('Servis raporu hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Teknisyen rapor verilerini getirir
   */
  static async getTechnicianReport(filters: ReportFilters): Promise<TechnicianReport> {
    const errorMessage = 'Teknisyen raporu getirilemedi';
    try {
      console.log('Teknisyen raporu için basit veri döndürülüyor...');
      // Şimdilik basit bir implementasyon - gerçek veri olmadığı için
      return {
        totalTechnicians: 5,
        activeTechnicians: 4,
        workload: [
          { technicianId: '1', name: 'Ahmet Yılmaz', completedJobs: 12, totalRevenue: 25000, averageRating: 4.8, efficiency: 95 },
          { technicianId: '2', name: 'Mehmet Demir', completedJobs: 8, totalRevenue: 18000, averageRating: 4.5, efficiency: 87 },
          { technicianId: '3', name: 'Ali Kaya', completedJobs: 15, totalRevenue: 32000, averageRating: 4.9, efficiency: 98 },
          { technicianId: '4', name: 'Mustafa Özkan', completedJobs: 6, totalRevenue: 12000, averageRating: 4.3, efficiency: 82 }
        ],
        productivity: {
          averageJobsPerDay: 2.5,
          averageRevenuePerTechnician: 15000,
          totalWorkHours: 160
        }
      };
    } catch (error) {
      console.error('Teknisyen raporu hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Gelir chart verilerini getirir
   */
  static async getRevenueChartData(filters: ReportFilters): Promise<RevenueChartData> {
    // Tarih aralığını belirle
    const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const endDate = filters.dateRange?.end || new Date().toISOString();

    // Base query
    let query = supabase.from('jobs').select(`
      job_date,
      total_cost
    `);

    // Müşteri filtresi varsa ekle
    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    // Tarih filtresi
    query = query
      .gte('job_date', startDate)
      .lte('job_date', endDate)
      .order('job_date', { ascending: true });

    const { data: jobs, error } = await query;

    if (error) {
      throw new Error(`Gelir grafiği verileri alınamadı: ${error.message}`);
    }

    // Günlük verileri grupla
    const dailyRevenue =
      jobs?.reduce((acc: Record<string, number>, job) => {
        const date = new Date(job.job_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (job.total_cost || 0);
        return acc;
      }, {}) || {};

    const daily = Object.entries(dailyRevenue)
      .map(([date, value]) => ({
        date,
        name: new Date(date).toLocaleDateString('tr-TR'),
        value: Number(value),
      }))
      .sort(
        (a, b) =>
          new Date(a.date ?? '').getTime() - new Date(b.date ?? '').getTime(),
      );

    // Yardımcı: ISO hafta numarası hesapla
    const getIsoWeek = (date: Date): number => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    // Haftalık gruplama
    const weeklyMap = new Map<string, { date: string; value: number }>();
    for (const point of daily) {
      if (!point.date) continue;
      const d = new Date(point.date);
      const isoYear = d.getUTCFullYear();
      const isoWeek = getIsoWeek(d);
      const key = `${isoYear}-W${isoWeek}`;
      const existing = weeklyMap.get(key);
      if (existing) {
        existing.value += point.value;
      } else {
        // Haftanın ilk günü (Pazartesi) - tamamen UTC üzerinden hesapla
        const weekStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const day = weekStart.getUTCDay() || 7;
        weekStart.setUTCDate(weekStart.getUTCDate() - (day - 1));
        weeklyMap.set(key, {
          date: weekStart.toISOString().split('T')[0],
          value: point.value,
        });
      }
    }

    const weekly = Array.from(weeklyMap.values())
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
      .map(({ date, value }) => ({
        date,
        name: `Hafta ${getIsoWeek(new Date(date))}`,
        value,
      }));

    // Aylık gruplama
    const monthlyMap = new Map<string, { date: string; value: number }>();
    for (const point of daily) {
      if (!point.date) continue;
      const d = new Date(point.date);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      const key = `${year}-${month}`;
      const monthStart = new Date(year, month, 1);
      const monthDate = monthStart.toISOString().split('T')[0];
      const existing = monthlyMap.get(key);
      if (existing) {
        existing.value += point.value;
      } else {
        monthlyMap.set(key, {
          date: monthDate,
          value: point.value,
        });
      }
    }

    const monthly = Array.from(monthlyMap.values())
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
      .map(({ date, value }) => ({
        date,
        name: new Date(date).toLocaleDateString('tr-TR', {
          month: 'short',
          year: '2-digit',
        }),
        value,
      }));

    // Yıllık gruplama
    const yearlyMap = new Map<string, { date: string; value: number }>();
    for (const point of daily) {
      if (!point.date) continue;
      const d = new Date(point.date);
      const year = d.getFullYear();
      const key = `${year}`;
      // Timezone kaymalarını engellemek için tarihi manuel oluştur
      const yearDate = `${year}-01-01`;
      const existing = yearlyMap.get(key);
      if (existing) {
        existing.value += point.value;
      } else {
        yearlyMap.set(key, {
          date: yearDate,
          value: point.value,
        });
      }
    }

    const yearly = Array.from(yearlyMap.entries())
      .sort(
        (a, b) =>
          new Date(a[1].date).getTime() - new Date(b[1].date).getTime(),
      )
      .map(([year, { date, value }]) => ({
        date,
        name: year, // Doğrudan yıl string'ini kullan
        value,
      }));

    return {
      daily,
      weekly,
      monthly,
      yearly,
    };
  }

  /**
   * Müşteri iş verilerini getirir
   */
  static async getCustomerJobsData(customerId: string, filters: ReportFilters): Promise<any[]> {
    const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const endDate = filters.dateRange?.end || new Date().toISOString();

    // Jobs ve financial_transactions tablosundan veri çek
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        job_description,
        job_date,
        total_cost,
        financial_transactions (
          amount,
          transaction_type
        )
      `)
      .eq('customer_id', customerId)
      .gte('job_date', startDate)
      .lte('job_date', endDate)
      .order('job_date', { ascending: true });

    if (error) {
      throw new Error(`Müşteri iş verileri alınamadı: ${error.message}`);
    }

    if (!jobs) return [];

    // Her iş için ödeme bilgilerini hesapla
    const jobsWithPayments = jobs.map(job => {
      const payments = job.financial_transactions?.filter(
        (transaction: any) => transaction.transaction_type === 'PAYMENT'
      ) || [];
      
      const paidAmount = payments.reduce(
        (sum: number, payment: any) => sum + (payment.amount || 0), 
        0
      );

      const totalCost = job.total_cost || 0;
      const remainingBalance = Math.max(0, totalCost - paidAmount);

      return {
        jobId: job.id,
        jobDescription: job.job_description || 'Açıklama yok',
        jobDate: job.job_date,
        totalCost,
        paidAmount,
        remainingBalance,
      };
    });

    return jobsWithPayments;
  }

  /**
   * Rapor export işlemi
   */
  static async exportReport(
    type: 'financial' | 'customer' | 'service' | 'technician',
    filters: ReportFilters,
    options: ReportExportOptions
  ): Promise<Blob> {
    const errorMessage = 'Rapor export edilemedi';
    try {
      // Bu implementasyon daha sonra geliştirilecek
      // Şimdilik basit bir CSV export yapıyoruz
      
      let reportData: any;
      switch (type) {
        case 'financial':
          reportData = await this.getFinancialReport(filters);
          break;
        case 'customer':
          reportData = await this.getCustomerReport(filters);
          break;
        case 'service':
          reportData = await this.getServiceReport(filters);
          break;
        case 'technician':
          reportData = await this.getTechnicianReport(filters);
          break;
        default:
          throw new Error('Geçersiz rapor tipi');
      }

      // CSV formatında export
      const csvContent = this.convertToCSV(reportData, type);
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { type, filters, options, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Yardımcı fonksiyonlar
   */
  private static calculatePeriodDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static subtractPeriod(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  private static convertToCSV(data: any, type: string): string {
    // Basit CSV dönüştürme implementasyonu
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(value => 
      typeof value === 'object' ? JSON.stringify(value) : value
    ).join(',');
    
    return `${headers}\n${values}`;
  }
} 