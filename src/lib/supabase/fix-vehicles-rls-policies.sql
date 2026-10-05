-- Vehicles tablosu için eksik RLS politikalarını ekle

-- Müşteriler kendi araçlarını güncelleyebilir
CREATE POLICY "Müşteriler kendi araçlarını güncelleyebilir"
ON vehicles FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- Müşteriler kendi araçlarını silebilir
CREATE POLICY "Müşteriler kendi araçlarını silebilir"
ON vehicles FOR DELETE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- Yöneticiler tüm araçları güncelleyebilir
CREATE POLICY "Yöneticiler tüm araçları güncelleyebilir"
ON vehicles FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin');

-- Yöneticiler tüm araçları silebilir
CREATE POLICY "Yöneticiler tüm araçları silebilir"
ON vehicles FOR DELETE
USING (get_user_role(auth.uid()) = 'admin'); 