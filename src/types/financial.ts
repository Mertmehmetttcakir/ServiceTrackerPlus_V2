export type FinancialTransactionType =
  | 'SERVICE_FEE' // Servis/işlem ücreti (Müşteriye borç)
  | 'PAYMENT' // Müşteriden alınan ödeme (Müşterinin borcunu azaltır)
  | 'REFUND' // Müşteriye yapılan iade (Müşterinin borcunu azaltır veya alacak oluşturur)
  | 'OTHER_DEBIT' // Diğer borçlandırma (Müşteriye borç)
  | 'OTHER_CREDIT'; // Diğer alacaklandırma/indirim (Müşterinin borcunu azaltır)

export interface FinancialTransaction {
  id: string;
  customer_id: string;
  vehicle_id?: string | null;
  appointment_id?: string | null;
  job_id?: string | null;
  transaction_type: FinancialTransactionType;
  amount: number;
  description?: string | null;
  transaction_date: string; // ISO Date string
  created_at: string;
  updated_at: string;

  // İlişkili veriler için (opsiyonel, servisler doldurabilir)
  customer?: { id: string; full_name: string };
  vehicle?: { id: string; plate: string };
}

export type FinancialTransactionCreate = Omit<
  FinancialTransaction,
  'id' | 'created_at' | 'updated_at' | 'customer' | 'vehicle'
>;

export type FinancialTransactionUpdate = Partial<
  Omit<FinancialTransactionCreate, 'customer_id' | 'job_id'>
>;

// Araç formuna eklenecek alanlar için geçici bir tip
// Bu tipi daha sonra Vehicle tipini genişleterek veya ayrı bir form tipi oluşturarak kullanabiliriz.
export interface InitialTransactionData {
  initial_service_fee?: number;
  initial_service_description?: string;
  payment_received?: number;
  payment_description?: string;
  transaction_date?: string; // Opsiyonel, yoksa backend/servis default atar
} 