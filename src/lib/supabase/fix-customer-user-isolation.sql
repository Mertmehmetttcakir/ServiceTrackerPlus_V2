-- Her kullanıcının sadece kendi oluşturduğu müşterileri görmesi için politikaları düzenle

-- Önce mevcut yönetici politikalarını sil
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm müşterileri görebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler tüm müşterileri görebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler tüm müşterileri güncelleyebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler müşteri silebilir" ON customers;

-- Yeni politikalar: Sadece kendi oluşturduğu müşteriler
CREATE POLICY "Kullanıcılar sadece kendi oluşturdukları müşterileri görebilir"
ON customers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar sadece kendi oluşturdukları müşterileri güncelleyebilir"
ON customers FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar sadece kendi oluşturdukları müşterileri silebilir"
ON customers FOR DELETE
USING (user_id = auth.uid());

-- Müşteri oluşturma politikası zaten doğru (user_id = auth.uid() ile)
-- Bu politika zaten var: "Kullanıcılar müşteri oluşturabilir" 