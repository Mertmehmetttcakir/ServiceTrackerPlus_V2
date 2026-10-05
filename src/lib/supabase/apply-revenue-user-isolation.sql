-- Ciro hesaplama için kullanıcı bazlı izolasyon uygula

-- 1. paid_jobs_revenue view'ını güncelle
DROP VIEW IF EXISTS paid_jobs_revenue;

CREATE VIEW paid_jobs_revenue AS
SELECT 
    ft.id as transaction_id,
    ft.customer_id,
    c.user_id as customer_user_id, -- Kullanıcı bazlı filtreleme için
    ft.job_id,
    CASE
      WHEN ft.transaction_type = 'PAYMENT' THEN ft.amount            -- Tahsil edilen tutar
      WHEN ft.transaction_type = 'REFUND'  THEN -ft.amount           -- İade edilen tutar (gelirden düş)
      ELSE 0
    END as paid_amount,
    ft.transaction_date,
    
    -- Tarih bazlı filtreleme için alanlar
    DATE(ft.transaction_date) as payment_day_ts,
    DATE_TRUNC('week', ft.transaction_date::date) as payment_week_ts,
    DATE_TRUNC('month', ft.transaction_date::date) as payment_month_ts,
    DATE_TRUNC('year', ft.transaction_date::date) as payment_year_ts,
    
    -- ISO hafta ve yıl hesaplamaları
    EXTRACT(ISOYEAR FROM ft.transaction_date::date) as payment_isoyear_num,
    EXTRACT(WEEK FROM ft.transaction_date::date) as payment_week_num,
    EXTRACT(YEAR FROM ft.transaction_date::date) as payment_year_num,
    EXTRACT(MONTH FROM ft.transaction_date::date) as payment_month_num,
    EXTRACT(DAY FROM ft.transaction_date::date) as payment_day_num
    
FROM financial_transactions ft
INNER JOIN customers c ON ft.customer_id = c.id
WHERE ft.transaction_type IN ('PAYMENT', 'REFUND') -- Ödeme ve iade işlemleri
  AND ft.amount > 0; -- Pozitif tutarları dahil et

-- 2. Financial transactions tablosu için RLS politikalarını temizle ve yeniden oluştur
-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin finansal işlemlerini görebilir" ON financial_transactions;
DROP POLICY IF EXISTS "Yöneticiler tüm finansal işlemleri görebilir" ON financial_transactions;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterileri için finansal işlem oluşturabilir" ON financial_transactions;
DROP POLICY IF EXISTS "Yöneticiler finansal işlem oluşturabilir" ON financial_transactions;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin finansal işlemlerini güncelleyebilir" ON financial_transactions;
DROP POLICY IF EXISTS "Adminler tüm finansal işlemleri yönetebilir" ON financial_transactions;

-- Sadece kullanıcı bazlı basit politikalar oluştur
CREATE POLICY "Kullanıcılar sadece kendi müşterilerinin finansal işlemlerini görebilir"
ON financial_transactions FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterileri için finansal işlem oluşturabilir"
ON financial_transactions FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar sadece kendi müşterilerinin finansal işlemlerini güncelleyebilir"
ON financial_transactions FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar sadece kendi müşterilerinin finansal işlemlerini silebilir"
ON financial_transactions FOR DELETE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- View'a yorum ekle
COMMENT ON VIEW paid_jobs_revenue IS 'Ödeme işlemlerinden elde edilen ciro verilerini kullanıcı bazlı filtreleme ile sunar. Her kullanıcı sadece kendi müşterilerinin ciro verilerini görebilir.'; 