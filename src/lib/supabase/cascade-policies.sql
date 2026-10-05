-- Cascade Delete Politikaları
-- Amaç: Ana kayıt (ör. Müşteri) silindiğinde ilişkili alt kayıtların (ör. Araçlar, Randevular) otomatik silinmesi.
-- Bu script'i Supabase SQL Editor'da çalıştırın.

-- 1. Vehicles -> Customers (Müşteri silinince araçları da sil)
ALTER TABLE vehicles 
  DROP CONSTRAINT IF EXISTS vehicles_customer_id_fkey,
  ADD CONSTRAINT vehicles_customer_id_fkey 
    FOREIGN KEY (customer_id) 
    REFERENCES customers(id) 
    ON DELETE CASCADE;

-- 2. Appointments -> Customers (Müşteri silinince randevuları da sil)
ALTER TABLE appointments 
  DROP CONSTRAINT IF EXISTS appointments_customer_id_fkey,
  ADD CONSTRAINT appointments_customer_id_fkey 
    FOREIGN KEY (customer_id) 
    REFERENCES customers(id) 
    ON DELETE CASCADE;

-- 3. Financial Transactions -> Customers (Müşteri silinince finansal işlemleri de sil)
ALTER TABLE financial_transactions 
  DROP CONSTRAINT IF EXISTS financial_transactions_customer_id_fkey,
  ADD CONSTRAINT financial_transactions_customer_id_fkey 
    FOREIGN KEY (customer_id) 
    REFERENCES customers(id) 
    ON DELETE CASCADE;

-- 4. Service History -> Appointments (Randevu silinince servis geçmişini de sil)
ALTER TABLE service_history 
  DROP CONSTRAINT IF EXISTS service_history_appointment_id_fkey,
  ADD CONSTRAINT service_history_appointment_id_fkey 
    FOREIGN KEY (appointment_id) 
    REFERENCES appointments(id) 
    ON DELETE CASCADE;

-- 5. Invoices -> Service History (Servis geçmişi silinince faturayı da sil)
ALTER TABLE invoices 
  DROP CONSTRAINT IF EXISTS invoices_service_history_id_fkey,
  ADD CONSTRAINT invoices_service_history_id_fkey 
    FOREIGN KEY (service_history_id) 
    REFERENCES service_history(id) 
    ON DELETE CASCADE;

-- 6. Jobs -> Customers (Müşteri silinince işleri de sil)
ALTER TABLE jobs 
  DROP CONSTRAINT IF EXISTS jobs_customer_id_fkey,
  ADD CONSTRAINT jobs_customer_id_fkey 
    FOREIGN KEY (customer_id) 
    REFERENCES customers(id) 
    ON DELETE CASCADE;

-- 7. Financial Transactions -> Jobs (İş silinince o işe ait ödemeleri de sil)
ALTER TABLE financial_transactions
  DROP CONSTRAINT IF EXISTS financial_transactions_job_id_fkey,
  ADD CONSTRAINT financial_transactions_job_id_fkey
    FOREIGN KEY (job_id) 
    REFERENCES jobs(id) 
    ON DELETE CASCADE;

-- Not: Error Logs için user_id cascade'i genellikle istenmez (loglar kalsın istenir),
-- o yüzden error_logs tablosuna dokunmuyoruz.

