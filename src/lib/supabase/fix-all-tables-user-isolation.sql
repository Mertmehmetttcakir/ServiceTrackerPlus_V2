-- Tüm tablolar için kullanıcı izolasyonunu sağla
-- Her kullanıcı sadece kendi oluşturduğu müşterilerin verilerini görebilir

-- VEHICLES tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm araçları görebilir" ON vehicles;
DROP POLICY IF EXISTS "Yöneticiler araç oluşturabilir" ON vehicles;
DROP POLICY IF EXISTS "Yöneticiler tüm araçları güncelleyebilir" ON vehicles;
DROP POLICY IF EXISTS "Yöneticiler tüm araçları silebilir" ON vehicles;
DROP POLICY IF EXISTS "Admin full access" ON vehicles;

-- APPOINTMENTS tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm randevuları görebilir" ON appointments;
DROP POLICY IF EXISTS "Teknisyenler kendilerine atanan randevuları görebilir" ON appointments;

-- JOBS tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm işleri görebilir" ON jobs;
DROP POLICY IF EXISTS "Adminler tüm işleri yönetebilir" ON jobs;

-- SERVICE_HISTORY tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Yöneticiler ve teknisyenler tüm servis geçmişini görebilir" ON service_history;

-- FINANCIAL_TRANSACTIONS tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Yöneticiler tüm finansal işlemleri görebilir" ON financial_transactions;
DROP POLICY IF EXISTS "Adminler tüm finansal işlemleri yönetebilir" ON financial_transactions;

-- SERVICE_ITEMS tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Admin full access" ON service_items;

-- INVOICES tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Admin full access" ON invoices;

-- TECHNICIANS tablosu için yönetici politikalarını sil
DROP POLICY IF EXISTS "Sadece yöneticiler teknisyen ekleyebilir" ON technicians;
DROP POLICY IF EXISTS "Sadece yöneticiler teknisyen güncelleyebilir" ON technicians;

-- Artık tüm kullanıcılar eşit, sadece kendi verilerine erişebilir
-- Teknisyen tablosu için herkes okuyabilir, herkes ekleyebilir/güncelleyebilir
CREATE POLICY "Herkes teknisyen oluşturabilir"
ON technicians FOR INSERT
WITH CHECK (true);

CREATE POLICY "Herkes teknisyen güncelleyebilir"
ON technicians FOR UPDATE
USING (true); 