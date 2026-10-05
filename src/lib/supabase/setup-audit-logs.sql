-- Audit Logs (Denetim Kayıtları) Sistemi

-- 1. Audit Logs tablosunu oluştur
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 2. Güvenlik (RLS) ayarları
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Sadece adminler denetim kayıtlarını görebilir
DROP POLICY IF EXISTS "Adminler denetim kayıtlarını görebilir" ON audit_logs;
CREATE POLICY "Adminler denetim kayıtlarını görebilir"
ON audit_logs FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);

-- Sistem tarafından insert yapılabilir (Trigger ile)
-- Normal kullanıcıların doğrudan insert/update/delete yapmasına gerek yok, trigger 'SECURITY DEFINER' fonksiyonu ile çalışacak.

-- 3. Otomatik kayıt fonksiyonu (Trigger Function)
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    changed_by
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Kritik tablolara trigger ekle

-- Customers tablosu
DROP TRIGGER IF EXISTS audit_customers ON customers;
CREATE TRIGGER audit_customers
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Jobs tablosu
DROP TRIGGER IF EXISTS audit_jobs ON jobs;
CREATE TRIGGER audit_jobs
AFTER INSERT OR UPDATE OR DELETE ON jobs
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Vehicles tablosu
DROP TRIGGER IF EXISTS audit_vehicles ON vehicles;
CREATE TRIGGER audit_vehicles
AFTER INSERT OR UPDATE OR DELETE ON vehicles
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Financial Transactions tablosu
DROP TRIGGER IF EXISTS audit_financial_transactions ON financial_transactions;
CREATE TRIGGER audit_financial_transactions
AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Appointments tablosu
DROP TRIGGER IF EXISTS audit_appointments ON appointments;
CREATE TRIGGER audit_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Service History tablosu
DROP TRIGGER IF EXISTS audit_service_history ON service_history;
CREATE TRIGGER audit_service_history
AFTER INSERT OR UPDATE OR DELETE ON service_history
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

