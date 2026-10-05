import { supabase } from '../lib/supabase';
import {
  Job,
  JobCreate,
  JobSummary,
  JobUpdate
} from '../types/job';
import { ServiceHistoryCreate } from '../types/serviceHistory';
import { logger } from '../utils/logger';
import { BaseApiService } from './baseApiService';

export class JobService extends BaseApiService {
  static async createJob(data: JobCreate): Promise<Job> {
    const job = await this.handleCreateRequest<Job>(
      async () =>
        supabase
          .from('jobs')
          .insert(data)
          .select('*') // jobs_with_balance view'ından gelen alanlar burada olmaz, direkt tablodan gelir
          .single(),
      'İş oluşturulamadı'
    );

    logger.info('Yeni iş oluşturuldu', {
      jobId: job.id,
      customerId: job.customer_id,
      vehicleId: job.vehicle_id,
    });

    try {
      // İlgili müşteri ve araç için otomatik servis geçmişi kaydı oluştur
      const serviceHistoryData: ServiceHistoryCreate = {
        customer_id: job.customer_id,
        vehicle_id: job.vehicle_id || '',
        service_date: job.job_date,
        service_type: 'job',
        description: job.job_description,
        cost: job.total_cost,
        status: job.status === 'Tamamlandı - Ödeme Bekliyor' || job.status === 'Tamamen Ödendi'
          ? 'completed'
          : 'in-progress',
        notes: job.notes || undefined,
      };

      await supabase
        .from('service_history')
        .insert(serviceHistoryData);
    } catch (error) {
      // Servis geçmişi hataları ana iş oluşturma akışını bozmamalı
      logger.error(
        'Servis geçmişi kaydı oluşturulamadı',
        error instanceof Error ? error : undefined,
        { jobId: job.id }
      );
    }

    return job;
  }

  static async getJobById(id: string): Promise<JobSummary> {
    return this.handleRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance')
          .select(`
            id:job_id, 
            customer_id, 
            vehicle_id, 
            job_description, 
            job_date, 
            total_cost, 
            status:job_status, 
            notes:job_notes, 
            created_at:job_created_at, 
            updated_at:job_updated_at, 
            deleted_at:job_deleted_at,
            total_paid_for_job, 
            total_refunded_for_job, 
            remaining_balance_for_job,
            customer:customers!customer_id (id, full_name, phone, email),
            vehicle:vehicles!vehicle_id (id, plate, brand, model, year)
          `)
          .eq('job_id', id)
          .single(), // Tekil kayıtta deleted_at kontrolü RLS veya çağıranın sorumluluğunda
      'İş detayları getirilemedi'
    );
  }

  static async getJobsByCustomerId(customerId: string): Promise<JobSummary[]> {
    return this.handleListRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance') // View'dan çekiyoruz
          .select('id:job_id, customer_id, vehicle_id, job_description, job_date, total_cost, status:job_status, notes:job_notes, created_at:job_created_at, updated_at:job_updated_at, deleted_at:job_deleted_at, total_paid_for_job, total_refunded_for_job, remaining_balance_for_job')
          .eq('customer_id', customerId)
          .is('job_deleted_at', null) // Sadece silinmemiş işleri getir
          .order('job_date', { ascending: false }),
      'Müşteriye ait işler getirilemedi'
    );
  }

  static async getAllJobs(): Promise<JobSummary[]> {
    return this.handleListRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance')
          .select('id:job_id, customer_id, vehicle_id, job_description, job_date, total_cost, status:job_status, notes:job_notes, created_at:job_created_at, updated_at:job_updated_at, deleted_at:job_deleted_at, total_paid_for_job, total_refunded_for_job, remaining_balance_for_job')
          .is('job_deleted_at', null)
          .order('job_date', { ascending: false }),
      'İşler getirilemedi'
    );
  }
  
  static async getJobsByVehicleId(vehicleId: string): Promise<JobSummary[]> {
    return this.handleListRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance') // View'dan çekiyoruz
          .select('id:job_id, customer_id, vehicle_id, job_description, job_date, total_cost, status:job_status, notes:job_notes, created_at:job_created_at, updated_at:job_updated_at, deleted_at:job_deleted_at, total_paid_for_job, total_refunded_for_job, remaining_balance_for_job')
          .eq('vehicle_id', vehicleId)
          .is('job_deleted_at', null) // Sadece silinmemiş işleri getir
          .order('job_date', { ascending: false }),
      'Araca ait işler getirilemedi'
    );
  }

  static async getDeletedJobsByCustomerId(customerId: string): Promise<JobSummary[]> {
    return this.handleListRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance')
          .select('id:job_id, customer_id, vehicle_id, job_description, job_date, total_cost, status:job_status, notes:job_notes, created_at:job_created_at, updated_at:job_updated_at, deleted_at:job_deleted_at, total_paid_for_job, total_refunded_for_job, remaining_balance_for_job')
          .eq('customer_id', customerId)
          .not('job_deleted_at', 'is', null) // Sadece silinmiş işleri getir
          .order('job_date', { ascending: false }),
      'Müşteriye ait silinen işler getirilemedi'
    );
  }

  static async updateJob(id: string, data: JobUpdate): Promise<Job> {
    // Güncelleme ana `jobs` tablosuna yapılır, bakiye view üzerinden okunur.
    const job = await this.handleUpdateRequest<Job>(
      async () =>
        supabase
          .from('jobs')
          .update(data)
          .eq('id', id)
          .select('*') 
          .single(),
      'İş güncellenemedi'
    );

    logger.info('İş güncellendi', {
      jobId: job.id,
      customerId: job.customer_id,
      vehicleId: job.vehicle_id,
      status: job.status,
    });

    return job;
  }

  static async updateJobNotes(id: string, notes: string): Promise<Job> {
    return this.updateJob(id, { notes });
  }

  static async deleteJob(id: string): Promise<void> {
    // Soft delete: deleted_at alanını güncelle
    await this.handleUpdateRequest<void>(
      async () => {
        const { error } = await supabase
          .from('jobs')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
        // handleUpdateRequest, data alanı boş olursa hata fırlattığı için
        // içi dolu (truthy) bir nesne döndürüyoruz.
        return { data: { success: true } as any, error: null } as any;
      },
      'İş silinemedi (Soft delete başarısız)'
    );

    logger.warn('İş soft delete ile arşive taşındı', { jobId: id });
  }

  // Silinen işi geri getirmek için
  static async restoreJob(id: string): Promise<void> {
    await this.handleUpdateRequest<void>(
      async () => {
        const { error } = await supabase
          .from('jobs')
          .update({ deleted_at: null })
          .eq('id', id);
        
        if (error) throw error;
        return { data: { success: true } as any, error: null } as any;
      },
      'İş geri getirilemedi'
    );

    logger.info('Arşivdeki iş geri getirildi', { jobId: id });
  }
}
