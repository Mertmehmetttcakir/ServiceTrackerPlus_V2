-- Soft Delete Altyapısı
-- Amaç: Verileri fiziksel olarak silmek yerine 'deleted_at' damgası vurarak gizlemek.

-- 1. jobs tablosuna deleted_at kolonu ekle
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- 2. jobs tablosu için RLS politikalarını güncelle
-- Önce mevcut SELECT politikasını kaldır (çakışmayı önlemek için)
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin işlerini görebilir" ON jobs;
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm işleri görebilir" ON jobs;

-- Yeni SELECT politikaları (Sadece silinmemişleri göster)
CREATE POLICY "Kullanıcılar kendi müşterilerinin aktif işlerini görebilir"
ON jobs FOR SELECT
USING (
  deleted_at IS NULL 
  AND customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Yöneticiler ve teknisyenler aktif işleri görebilir"
ON jobs FOR SELECT
USING (
  deleted_at IS NULL 
  AND COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) IN ('admin', 'technician')
);

-- 3. Silinmiş işleri görme yetkisi (Sadece Adminler için opsiyonel bir politika)
-- Eğer admin "Silinenleri Gör" filtresi kullanacaksa bu politika devreye girecek
CREATE POLICY "Adminler silinmiş işleri de görebilir"
ON jobs FOR SELECT
USING (
  deleted_at IS NOT NULL 
  AND COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) = 'admin'
);

-- 4. Soft Delete işlemi için UPDATE politikası
-- Silme işlemi aslında bir UPDATE olduğu için UPDATE politikaları zaten yetki veriyor.
-- Ancak normal kullanıcıların 'deleted_at' alanını değiştirebilmesi lazım.
-- Mevcut UPDATE politikaları buna izin veriyor, ekstra bir şey yapmaya gerek yok.

