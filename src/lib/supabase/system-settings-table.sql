-- Sistem ayarları tablosu
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Uygulama Ayarları
  language VARCHAR(5) NOT NULL DEFAULT 'tr',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Istanbul',
  currency VARCHAR(5) NOT NULL DEFAULT 'TRY',
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
  records_per_page INTEGER NOT NULL DEFAULT 25,
  monthly_appointment_target INTEGER NOT NULL DEFAULT 150,
  monthly_revenue_target INTEGER NOT NULL DEFAULT 50000,
  
  -- Bildirim Ayarları
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  appointment_reminders BOOLEAN NOT NULL DEFAULT true,
  payment_reminders BOOLEAN NOT NULL DEFAULT true,
  
  -- Güvenlik Ayarları
  session_timeout INTEGER NOT NULL DEFAULT 60, -- dakika cinsinden
  auto_logout BOOLEAN NOT NULL DEFAULT true,
  
  -- Yedekleme Ayarları
  auto_backup BOOLEAN NOT NULL DEFAULT true,
  backup_frequency VARCHAR(20) NOT NULL DEFAULT 'weekly',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_user_settings UNIQUE (user_id),
  CONSTRAINT valid_language CHECK (language IN ('tr', 'en')),
  CONSTRAINT valid_currency CHECK (currency IN ('TRY', 'USD', 'EUR')),
  CONSTRAINT valid_date_format CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  CONSTRAINT valid_records_per_page CHECK (records_per_page >= 10 AND records_per_page <= 100),
  CONSTRAINT valid_monthly_appointment_target CHECK (monthly_appointment_target >= 0),
  CONSTRAINT valid_monthly_revenue_target CHECK (monthly_revenue_target >= 0),
  CONSTRAINT valid_session_timeout CHECK (session_timeout >= 15 AND session_timeout <= 480),
  CONSTRAINT valid_backup_frequency CHECK (backup_frequency IN ('daily', 'weekly', 'monthly'))
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_system_settings_user_id ON system_settings(user_id);

-- Otomatik timestamp güncelleme için trigger
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- RLS (Row Level Security) etkinleştir
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
-- Kullanıcılar sadece kendi sistem ayarlarını görebilir
CREATE POLICY "Users can view own system settings" 
ON system_settings FOR SELECT 
USING (auth.uid() = user_id);

-- Kullanıcılar kendi sistem ayarlarını oluşturabilir
CREATE POLICY "Users can insert own system settings" 
ON system_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi sistem ayarlarını güncelleyebilir
CREATE POLICY "Users can update own system settings" 
ON system_settings FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi sistem ayarlarını silebilir
CREATE POLICY "Users can delete own system settings" 
ON system_settings FOR DELETE 
USING (auth.uid() = user_id);

-- Kullanıcı oluşturulduğunda varsayılan ayarları oluştur
CREATE OR REPLACE FUNCTION create_default_system_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni kullanıcı için varsayılan ayarları ekle
  INSERT INTO public.system_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Yeni kullanıcı (auth.users) oluşturulduğunda varsayılan sistem ayarlarını oluştur
CREATE TRIGGER trigger_create_default_system_settings_after_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_system_settings(); 