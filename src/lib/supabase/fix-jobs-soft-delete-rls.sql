-- Jobs tablosu için RLS'yi sade ve tutarlı hale getir
-- Amaç: 
--  - Her kullanıcı sadece kendi müşterilerine ait işleri görebilsin / oluşturabilsin / güncelleyebilsin / (gerekirse) silebilsin
--  - Soft delete (deleted_at UPDATE) işlemi sorunsuz çalışsın

-- 1) Jobs tablosundaki eski / çakışan politikaları temizle
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin işlerini görebilir" ON jobs;
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm işleri görebilir" ON jobs;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterileri için iş oluşturabilir" ON jobs;
DROP POLICY IF EXISTS "Yöneticiler iş oluşturabilir" ON jobs;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin işlerini güncelleyebilir" ON jobs;
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm işleri güncelleyebilir" ON jobs;
DROP POLICY IF EXISTS "Yöneticiler iş silebilir" ON jobs;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin işlerini silebilir" ON jobs;
DROP POLICY IF EXISTS "Adminler tüm işleri yönetebilir" ON jobs;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin aktif işlerini görebilir" ON jobs;
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler aktif işleri görebilir" ON jobs;
DROP POLICY IF EXISTS "Adminler silinmiş işleri de görebilir" ON jobs;

-- 2) RLS'nin açık olduğundan emin ol
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 3) SELECT: Kullanıcı sadece kendi müşterilerine ait tüm işleri görebilir
--    (deleted_at hem NULL hem NOT NULL için geçerli; aktif / arşiv ayrımını view ve sorgular yapıyor)
CREATE POLICY "jobs_select_own"
ON jobs FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

-- 4) INSERT: Kullanıcı sadece kendi müşterileri için iş oluşturabilir
CREATE POLICY "jobs_insert_own"
ON jobs FOR INSERT
WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

-- 5) UPDATE: Kullanıcı sadece kendi müşterilerine ait işleri güncelleyebilir
--    Soft delete (deleted_at SET ...) de bu kapsamda olduğu için bu politika yeterli
CREATE POLICY "jobs_update_own"
ON jobs FOR UPDATE
USING (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);

-- 6) DELETE: İstersen ileride hard delete kullanmak istersen kullanıcı sadece kendi işlerini silebilsin
--    Uygulama şu an soft delete kullandığı için bu politika kritik değil ama tamlık için ekleniyor.
CREATE POLICY "jobs_delete_own"
ON jobs FOR DELETE
USING (
  customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
);
