-- RLS Performans Optimizasyonu
-- Amaç: get_user_role fonksiyonunu kaldırmak ve RLS politikalarında JWT rol bilgisini doğrudan kullanmak.
-- Bu script'i Supabase SQL Editor'da (New Query) çalıştırabilirsiniz.

-- 0) ÖNEMLİ NOT: JWT içinde rol bilgisi
-- Supabase Auth > Users > (Kullanıcı) > Raw JSON içinde aşağıdaki gibi bir yapı olmalı:
-- {
--   "app_metadata": {
--     "role": "admin" | "technician" | "customer"
--   },
--   "user_metadata": {
--     ...
--   }
-- }
-- Aşağıdaki politikalar, öncelikli olarak app_metadata.role, yoksa user_metadata.role alanını okur.


-- 1) Eski get_user_role fonksiyonunu kaldır
DROP FUNCTION IF EXISTS get_user_role(uuid);


-- 2) Customers tablosu için admin / technician politikalarını JWT ile güncelle
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm müşterileri görebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler tüm müşterileri güncelleyebilir" ON customers;
DROP POLICY IF EXISTS "Yöneticiler müşteri silebilir" ON customers;

CREATE POLICY "Yöneticiler ve teknisyenler tüm müşterileri görebilir"
ON customers FOR SELECT
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) IN ('admin', 'technician')
);

CREATE POLICY "Yöneticiler tüm müşterileri güncelleyebilir"
ON customers FOR UPDATE
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) = 'admin'
);

CREATE POLICY "Yöneticiler müşteri silebilir"
ON customers FOR DELETE
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) = 'admin'
);


-- 3) Vehicles tablosu için admin / technician politikalarını JWT ile güncelle
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm araçları görebilir" ON vehicles;
DROP POLICY IF EXISTS "Yöneticiler araç oluşturabilir" ON vehicles;

CREATE POLICY "Yöneticiler ve teknisyenler tüm araçları görebilir"
ON vehicles FOR SELECT
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) IN ('admin', 'technician')
);

CREATE POLICY "Yöneticiler araç oluşturabilir"
ON vehicles FOR INSERT
WITH CHECK (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) = 'admin'
);


-- 4) Appointments tablosu için admin / technician politikalarını JWT ile güncelle
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm randevuları görebilir" ON appointments;

CREATE POLICY "Yöneticiler ve teknisyenler tüm randevuları görebilir"
ON appointments FOR SELECT
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) IN ('admin', 'technician')
);


-- 5) Service_history tablosu için admin / technician politikalarını JWT ile güncelle
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm servis geçmişini görebilir" ON service_history;

CREATE POLICY "Yöneticiler ve teknisyenler tüm servis geçmişini görebilir"
ON service_history FOR SELECT
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) IN ('admin', 'technician')
);


-- 6) Technicians tablosu için admin politikalarını JWT ile güncelle
DROP POLICY IF EXISTS "Sadece yöneticiler teknisyen ekleyebilir" ON technicians;
DROP POLICY IF EXISTS "Sadece yöneticiler teknisyen güncelleyebilir" ON technicians;

CREATE POLICY "Sadece yöneticiler teknisyen ekleyebilir"
ON technicians FOR INSERT
WITH CHECK (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) = 'admin'
);

CREATE POLICY "Sadece yöneticiler teknisyen güncelleyebilir"
ON technicians FOR UPDATE
USING (
  COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'customer'
  ) = 'admin'
);


-- 7) Not: Diğer RLS politikaları (müşteri kendi verisini görür, kullanıcı kendi müşterilerini görür vb.)
-- zaten auth.uid() ve customers.user_id üzerinden çalışıyor, ek bir fonksiyon çağrısı yapmıyor.
-- Bu script özellikle rol tabanlı (admin/technician) politikaları optimize eder.


