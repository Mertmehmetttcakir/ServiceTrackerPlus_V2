-- ServiceTracker Plus - Eksik View'ları Oluşturma
-- Raporlama sistemi için gerekli view'lar

-- 1. HAFTALIK GELİR VIEW'I
DROP VIEW IF EXISTS weekly_revenue;
CREATE VIEW weekly_revenue AS
SELECT 
    c.user_id as customer_user_id,
    DATE_TRUNC('week', ft.transaction_date) as week_start,
    EXTRACT(ISOYEAR FROM ft.transaction_date) as year,
    EXTRACT(WEEK FROM ft.transaction_date) as week_number,
    SUM(ft.amount) as total_revenue,
    COUNT(DISTINCT ft.job_id) as job_count,
    COUNT(DISTINCT ft.customer_id) as customer_count
FROM financial_transactions ft
INNER JOIN customers c ON ft.customer_id = c.id
WHERE ft.transaction_type = 'PAYMENT' AND ft.amount > 0
GROUP BY c.user_id, DATE_TRUNC('week', ft.transaction_date), 
         EXTRACT(ISOYEAR FROM ft.transaction_date), 
         EXTRACT(WEEK FROM ft.transaction_date)
ORDER BY year DESC, week_number DESC;

-- 2. AYLIK GELİR VIEW'I
DROP VIEW IF EXISTS monthly_revenue;
CREATE VIEW monthly_revenue AS
SELECT 
    c.user_id as customer_user_id,
    DATE_TRUNC('month', ft.transaction_date) as month_start,
    EXTRACT(YEAR FROM ft.transaction_date) as year,
    EXTRACT(MONTH FROM ft.transaction_date) as month_number,
    SUM(ft.amount) as total_revenue,
    COUNT(DISTINCT ft.job_id) as job_count,
    COUNT(DISTINCT ft.customer_id) as customer_count,
    AVG(ft.amount) as average_transaction_amount
FROM financial_transactions ft
INNER JOIN customers c ON ft.customer_id = c.id
WHERE ft.transaction_type = 'PAYMENT' AND ft.amount > 0
GROUP BY c.user_id, DATE_TRUNC('month', ft.transaction_date),
         EXTRACT(YEAR FROM ft.transaction_date), 
         EXTRACT(MONTH FROM ft.transaction_date)
ORDER BY year DESC, month_number DESC;

-- 3. YILLIK GELİR VIEW'I
DROP VIEW IF EXISTS yearly_revenue;
CREATE VIEW yearly_revenue AS
SELECT 
    c.user_id as customer_user_id,
    DATE_TRUNC('year', ft.transaction_date) as year_start,
    EXTRACT(YEAR FROM ft.transaction_date) as year,
    SUM(ft.amount) as total_revenue,
    COUNT(DISTINCT ft.job_id) as job_count,
    COUNT(DISTINCT ft.customer_id) as customer_count,
    AVG(ft.amount) as average_transaction_amount,
    COUNT(ft.id) as transaction_count
FROM financial_transactions ft
INNER JOIN customers c ON ft.customer_id = c.id
WHERE ft.transaction_type = 'PAYMENT' AND ft.amount > 0
GROUP BY c.user_id, DATE_TRUNC('year', ft.transaction_date),
         EXTRACT(YEAR FROM ft.transaction_date)
ORDER BY year DESC;

-- 4. TEKNİSYEN PERFORMANS VIEW'I
DROP VIEW IF EXISTS technician_performance;
CREATE VIEW technician_performance AS
SELECT 
    t.id as technician_id,
    COALESCE(t.full_name, t.id) as technician_name,
    c.user_id as customer_user_id,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT j.id) as total_jobs,
    SUM(j.total_cost) as total_revenue,
    AVG(j.total_cost) as average_job_value,
    COUNT(DISTINCT j.customer_id) as unique_customers,
    -- Son 30 günde tamamlanan işler
    COUNT(DISTINCT CASE 
        WHEN j.job_date >= CURRENT_DATE - INTERVAL '30 days' 
             AND j.status = 'Tamamen Ödendi' 
        THEN j.id 
    END) as completed_jobs_last_30_days,
    -- Verimlilik skoru (tamamlanan işler / toplam işler)
    CASE 
        WHEN COUNT(j.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN j.status = 'Tamamen Ödendi' THEN 1 END)::DECIMAL / COUNT(j.id)) * 100, 2)
        ELSE 0 
    END as completion_rate_percent
FROM technicians t
LEFT JOIN appointments a ON t.id = a.technician_id
LEFT JOIN jobs j ON a.customer_id = j.customer_id
LEFT JOIN customers c ON j.customer_id = c.id
GROUP BY t.id, t.full_name, c.user_id;

-- 5. MÜŞTERİ SEGMENTASYON VIEW'I
DROP VIEW IF EXISTS customer_segmentation;
CREATE VIEW customer_segmentation AS
SELECT 
    c.user_id as customer_user_id,
    c.id as customer_id,
    c.full_name as customer_name,
    -- Toplam harcama
    COALESCE(SUM(ft.amount), 0) as total_spent,
    -- İş sayısı
    COUNT(DISTINCT j.id) as job_count,
    -- Ortalama işlem tutarı
    CASE 
        WHEN COUNT(DISTINCT j.id) > 0 THEN 
            COALESCE(SUM(ft.amount), 0) / COUNT(DISTINCT j.id)
        ELSE 0 
    END as average_job_value,
    -- Son iş tarihi
    MAX(j.job_date) as last_job_date,
    -- Müşteri segmenti (harcama bazlı)
    CASE 
        WHEN COALESCE(SUM(ft.amount), 0) >= 10000 THEN 'VIP'
        WHEN COALESCE(SUM(ft.amount), 0) >= 5000 THEN 'Premium'
        WHEN COALESCE(SUM(ft.amount), 0) >= 1000 THEN 'Standard'
        ELSE 'Basic'
    END as customer_segment,
    -- Müşteri yaşı (kayıt tarihinden itibaren)
    EXTRACT(DAYS FROM CURRENT_DATE - c.created_at::date) as customer_age_days,
    -- Aktivite durumu
    CASE 
        WHEN MAX(j.job_date) >= CURRENT_DATE - INTERVAL '90 days' THEN 'Aktif'
        WHEN MAX(j.job_date) >= CURRENT_DATE - INTERVAL '180 days' THEN 'Pasif'
        ELSE 'Inactive'
    END as activity_status
FROM customers c
LEFT JOIN jobs j ON c.id = j.customer_id
LEFT JOIN financial_transactions ft ON j.id = ft.job_id AND ft.transaction_type = 'PAYMENT'
GROUP BY c.user_id, c.id, c.full_name, c.created_at;

-- 6. SERVİS ANALİZİ VIEW'I
DROP VIEW IF EXISTS service_analysis;
CREATE VIEW service_analysis AS
SELECT 
    c.user_id as customer_user_id,
    j.job_description as service_type,
    COUNT(j.id) as service_count,
    SUM(j.total_cost) as total_revenue,
    AVG(j.total_cost) as average_price,
    COUNT(DISTINCT j.customer_id) as unique_customers,
    -- Son 30 günde bu servis türü
    COUNT(CASE 
        WHEN j.job_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 
    END) as recent_count,
    -- En yüksek ve en düşük fiyat
    MAX(j.total_cost) as max_price,
    MIN(j.total_cost) as min_price,
    -- Ortalama tamamlanma süresi (tahmini)
    AVG(EXTRACT(DAYS FROM j.updated_at - j.created_at)) as avg_completion_days
FROM jobs j
INNER JOIN customers c ON j.customer_id = c.id
WHERE j.job_description IS NOT NULL AND j.job_description != ''
GROUP BY c.user_id, j.job_description;

-- 7. FİNANSAL ÖZET VIEW'I
DROP VIEW IF EXISTS financial_summary;
CREATE VIEW financial_summary AS
SELECT 
    c.user_id as customer_user_id,
    -- Gelir istatistikleri
    SUM(CASE WHEN ft.transaction_type = 'PAYMENT' THEN ft.amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN ft.transaction_type = 'REFUND' THEN ft.amount ELSE 0 END) as total_refunds,
    SUM(CASE WHEN ft.transaction_type = 'DISCOUNT' THEN ft.amount ELSE 0 END) as total_discounts,
    -- Net gelir
    SUM(CASE WHEN ft.transaction_type = 'PAYMENT' THEN ft.amount ELSE -ft.amount END) as net_revenue,
    -- İşlem sayıları
    COUNT(CASE WHEN ft.transaction_type = 'PAYMENT' THEN 1 END) as payment_count,
    COUNT(CASE WHEN ft.transaction_type = 'REFUND' THEN 1 END) as refund_count,
    -- Bekleyen ödemeler (jobs_with_balance view'ından)
    (SELECT COALESCE(SUM(jwb.remaining_balance_for_job), 0) 
     FROM jobs_with_balance jwb 
     WHERE jwb.customer_user_id = c.user_id) as pending_amount,
    -- Ortalama işlem tutarı
    AVG(CASE WHEN ft.transaction_type = 'PAYMENT' THEN ft.amount END) as avg_payment_amount,
    -- Bu ayki gelir
    SUM(CASE 
        WHEN ft.transaction_type = 'PAYMENT' 
             AND ft.transaction_date >= DATE_TRUNC('month', CURRENT_DATE) 
        THEN ft.amount 
        ELSE 0 
    END) as current_month_revenue,
    -- Geçen ayki gelir
    SUM(CASE 
        WHEN ft.transaction_type = 'PAYMENT' 
             AND ft.transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
             AND ft.transaction_date < DATE_TRUNC('month', CURRENT_DATE)
        THEN ft.amount 
        ELSE 0 
    END) as previous_month_revenue
FROM customers c
LEFT JOIN financial_transactions ft ON c.id = ft.customer_id
GROUP BY c.user_id;

-- View'lara açıklamalar ekle
COMMENT ON VIEW weekly_revenue IS 'Haftalık gelir istatistikleri - kullanıcı bazlı';
COMMENT ON VIEW monthly_revenue IS 'Aylık gelir istatistikleri - kullanıcı bazlı';
COMMENT ON VIEW yearly_revenue IS 'Yıllık gelir istatistikleri - kullanıcı bazlı';
COMMENT ON VIEW technician_performance IS 'Teknisyen performans metrikleri - kullanıcı bazlı';
COMMENT ON VIEW customer_segmentation IS 'Müşteri segmentasyon analizi - kullanıcı bazlı';
COMMENT ON VIEW service_analysis IS 'Servis türü analizi - kullanıcı bazlı';
COMMENT ON VIEW financial_summary IS 'Finansal özet raporu - kullanıcı bazlı'; 