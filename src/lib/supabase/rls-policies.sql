-- RLS'yi etkinleştir
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles için politikalar
CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Kullanıcı rolünü almak için yardımcı fonksiyon
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Müşteriler için politikalar
CREATE POLICY "Müşteriler kendi verilerini görebilir"
ON customers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Yöneticiler ve teknisyenler tüm müşterileri görebilir"
ON customers FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'technician'));

CREATE POLICY "Kullanıcılar müşteri oluşturabilir"
ON customers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Müşteriler kendi verilerini güncelleyebilir"
ON customers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Yöneticiler tüm müşterileri güncelleyebilir"
ON customers FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Yöneticiler müşteri silebilir"
ON customers FOR DELETE
USING (get_user_role(auth.uid()) = 'admin');

-- Araçlar için politikalar
CREATE POLICY "Müşteriler kendi araçlarını görebilir"
ON vehicles FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler ve teknisyenler tüm araçları görebilir"
ON vehicles FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'technician'));

CREATE POLICY "Müşteriler kendi araçlarını oluşturabilir"
ON vehicles FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler araç oluşturabilir"
ON vehicles FOR INSERT
WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Randevular için politikalar
CREATE POLICY "Müşteriler kendi randevularını görebilir"
ON appointments FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Teknisyenler kendilerine atanan randevuları görebilir"
ON appointments FOR SELECT
USING (technician_id = auth.uid());

CREATE POLICY "Yöneticiler ve teknisyenler tüm randevuları görebilir"
ON appointments FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'technician'));

-- Servis geçmişi için politikalar
CREATE POLICY "Müşteriler kendi servis geçmişini görebilir"
ON service_history FOR SELECT
USING (appointment_id IN (
  SELECT id FROM appointments WHERE customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Yöneticiler ve teknisyenler tüm servis geçmişini görebilir"
ON service_history FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'technician'));

-- Teknisyenler için politikalar
CREATE POLICY "Herkes teknisyenleri görebilir"
ON technicians FOR SELECT
USING (true);

CREATE POLICY "Sadece yöneticiler teknisyen ekleyebilir"
ON technicians FOR INSERT
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Sadece yöneticiler teknisyen güncelleyebilir"
ON technicians FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin'); 