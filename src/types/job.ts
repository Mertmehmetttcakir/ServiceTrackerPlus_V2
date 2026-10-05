import { Customer } from './customer';
import { FinancialTransaction } from './financial';
import { Vehicle } from './vehicle';

export type JobStatus = 
  | 'Açık'
  | 'Tamamlandı - Ödeme Bekliyor'
  | 'Kısmi Ödendi'
  | 'Tamamen Ödendi'
  | 'İptal Edildi';

export interface Job {
  id: string;
  customer_id: string;
  vehicle_id?: string | null;
  job_description: string;
  job_date: string; // ISO Date string
  total_cost: number;
  status: JobStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // Soft delete için eklendi

  // İlişkili veriler (Servisler ve hooklar tarafından doldurulabilir)
  customer?: Customer; // Basit bir referans veya tam Customer objesi olabilir
  vehicle?: Vehicle;
  financial_transactions?: FinancialTransaction[]; // Bu işe ait finansal işlemler
  
  // jobs_with_balance view'ından gelen ek alanlar
  total_paid_for_job?: number;
  total_refunded_for_job?: number;
  remaining_balance_for_job?: number;
}

export type JobCreate = Omit<
  Job,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'customer' | 'vehicle' | 'financial_transactions' | 'total_paid_for_job' | 'total_refunded_for_job' | 'remaining_balance_for_job'
>;

export type JobUpdate = Partial<Omit<JobCreate, 'customer_id' | 'vehicle_id'>>; // Müşteri ve araç genellikle değiştirilmez

// Müşteri detay sayfasında işleri listelemek için kullanılabilecek bir tip
export interface JobSummary extends Job {
  // jobs_with_balance view'ından gelen alanlar zaten Job içinde opsiyonel olarak var
}
