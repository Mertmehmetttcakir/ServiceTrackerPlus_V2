-- Şirket profilleri tablosu
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'Türkiye',
  tax_number VARCHAR(50),
  logo_url TEXT,
  website VARCHAR(255),
  working_hours JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "18:00", "closed": false},
    "tuesday": {"start": "09:00", "end": "18:00", "closed": false},
    "wednesday": {"start": "09:00", "end": "18:00", "closed": false},
    "thursday": {"start": "09:00", "end": "18:00", "closed": false},
    "friday": {"start": "09:00", "end": "18:00", "closed": false},
    "saturday": {"start": "09:00", "end": "17:00", "closed": false},
    "sunday": {"start": "10:00", "end": "16:00", "closed": true}
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_user_company UNIQUE (user_id),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone ~ '^[\+]?[0-9\(\)\-\s]+$')
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_name ON company_profiles(name);
CREATE INDEX IF NOT EXISTS idx_company_profiles_city ON company_profiles(city);

-- Otomatik timestamp güncelleme için trigger
CREATE OR REPLACE FUNCTION update_company_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profiles_updated_at();

-- RLS (Row Level Security) etkinleştir
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
-- Kullanıcılar sadece kendi şirket profillerini görebilir
CREATE POLICY "Users can view own company profile" 
ON company_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Kullanıcılar kendi şirket profillerini oluşturabilir
CREATE POLICY "Users can insert own company profile" 
ON company_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi şirket profillerini güncelleyebilir
CREATE POLICY "Users can update own company profile" 
ON company_profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi şirket profillerini silebilir
CREATE POLICY "Users can delete own company profile" 
ON company_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Storage bucket için politikalar
-- company-logos bucket'ı oluşturulmalı
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage politikaları
CREATE POLICY "Users can upload their own company logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own company logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own company logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Genel amaçlı görünümler (isteğe bağlı)
CREATE OR REPLACE VIEW company_profiles_with_stats AS
SELECT 
  cp.*,
  (SELECT COUNT(*) FROM customers c WHERE c.user_id = cp.user_id) as total_customers,
  (SELECT COUNT(*) FROM jobs j 
   JOIN customers c ON j.customer_id = c.id 
   WHERE c.user_id = cp.user_id) as total_jobs
FROM company_profiles cp; 