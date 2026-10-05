-- Customers tablosuna user_id alanı ekleme
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Mevcut customers tablosundaki verileri güncelleme (isteğe bağlı)
-- Bu kısım mevcut verileriniz varsa ve bunları belirli bir kullanıcıya atamak istiyorsanız kullanılabilir

-- Customers extended details view'ini güncelleme (user_id alanını dahil etmek için)
DROP VIEW IF EXISTS customers_extended_details;

CREATE VIEW customers_extended_details AS
SELECT 
    c.id,
    c.user_id,
    c.full_name,
    c.email,
    c.phone,
    c.address,
    c.created_at as customer_created_at,
    c.updated_at as customer_updated_at,
    MAX(a.appointment_date) as last_appointment_date,
    COALESCE(SUM(ft.remaining_balance_for_job), 0) as total_outstanding_balance_from_jobs
FROM customers c
LEFT JOIN appointments a ON c.id = a.customer_id
LEFT JOIN (
    SELECT 
        j.customer_id,
        j.id as job_id,
        j.total_cost - COALESCE(SUM(ft.amount), 0) as remaining_balance_for_job
    FROM jobs j
    LEFT JOIN financial_transactions ft ON j.id = ft.job_id AND ft.transaction_type = 'PAYMENT'
    GROUP BY j.id, j.customer_id, j.total_cost
) ft ON c.id = ft.customer_id
GROUP BY c.id, c.user_id, c.full_name, c.email, c.phone, c.address, c.created_at, c.updated_at;

-- User profiles tablosu için trigger oluşturma (kullanıcı kaydı sırasında otomatik profil oluşturma)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı auth.users tablosuna bağlama
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 