-- Customers tablosundaki tüm politikaları temizle ve sadece kullanıcı bazlı izolasyon sağla

-- Tüm mevcut politikaları sil
DROP POLICY IF EXISTS "Admin full access" ON customers;
DROP POLICY IF EXISTS "Müşteriler kendi verilerini görebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm müşterileri görebilir" ON customers;
DROP POLICY IF EXISTS "Kullanıcılar müşteri oluşturabilir" ON customers;
DROP POLICY IF EXISTS "Müşteriler kendi verilerini güncelleyebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler tüm müşterileri güncelleyebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler müşteri silebilir" ON customers;
DROP POLICY IF EXISTS "Adminler kendi ekledikleri müşterileri yönetebilir" ON customers;
DROP POLICY IF EXISTS "Teknisyenler tüm müşterileri görebilir" ON customers;
DROP POLICY IF EXISTS "Müşteriler kendi profilini görebilir (eğer user_id eşleşi" ON customers;
DROP POLICY IF EXISTS "Adminler müşteri ekleyebilir" ON customers;

-- Sadece kullanıcı bazlı basit politikalar oluştur
-- Her kullanıcı sadece kendi oluşturduğu müşterileri görebilir/yönetebilir

CREATE POLICY "Kullanıcılar sadece kendi müşterilerini görebilir"
ON customers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar müşteri oluşturabilir"
ON customers FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Kullanıcılar sadece kendi müşterilerini güncelleyebilir"
ON customers FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar sadece kendi müşterilerini silebilir"
ON customers FOR DELETE
USING (user_id = auth.uid()); 