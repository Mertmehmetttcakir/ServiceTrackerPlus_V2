-- jobs_with_balance view'ını soft delete alanıyla birlikte güncelle
-- financial_summary view'u jobs_with_balance'a bağlı olduğu için önce onu düşürüyoruz
DROP VIEW IF EXISTS financial_summary;
DROP VIEW IF EXISTS jobs_with_balance;

CREATE VIEW jobs_with_balance AS
SELECT 
  j.id AS job_id,
  j.customer_id,
  j.vehicle_id,
  j.job_description,
  j.job_date,
  j.total_cost,
  j.status AS job_status,
  j.notes AS job_notes,
  j.created_at AS job_created_at,
  j.updated_at AS job_updated_at,
  j.deleted_at AS job_deleted_at,
  c.user_id AS customer_user_id,
  COALESCE(SUM(CASE WHEN ft.transaction_type = 'PAYMENT' THEN ft.amount ELSE 0 END), 0) AS total_paid_for_job,
  COALESCE(SUM(CASE WHEN ft.transaction_type = 'REFUND' THEN ft.amount ELSE 0 END), 0) AS total_refunded_for_job,
  j.total_cost
    - COALESCE(SUM(CASE WHEN ft.transaction_type = 'PAYMENT' THEN ft.amount ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN ft.transaction_type = 'REFUND' THEN ft.amount ELSE 0 END), 0) AS remaining_balance_for_job
FROM jobs j
LEFT JOIN customers c ON j.customer_id = c.id
LEFT JOIN financial_transactions ft ON ft.job_id = j.id
GROUP BY 
  j.id,
  j.customer_id,
  j.vehicle_id,
  j.job_description,
  j.job_date,
  j.total_cost,
  j.status,
  j.notes,
  j.created_at,
  j.updated_at,
  j.deleted_at,
  c.user_id;

COMMENT ON VIEW jobs_with_balance IS 'İş kayıtlarını ödeme bakiyeleri ve soft delete bilgisiyle birlikte sunar';

-- financial_summary view'unu yeniden oluştur
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

COMMENT ON VIEW financial_summary IS 'Finansal özet raporu - kullanıcı bazlı';

