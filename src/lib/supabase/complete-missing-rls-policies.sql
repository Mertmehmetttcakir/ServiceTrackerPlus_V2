-- Eksik RLS politikalarını tamamla

-- APPOINTMENTS tablosu için eksik politikalar
CREATE POLICY "Kullanıcılar kendi müşterilerinin randevularını oluşturabilir"
ON appointments FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin randevularını güncelleyebilir"
ON appointments FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin randevularını silebilir"
ON appointments FOR DELETE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- SERVICE_HISTORY tablosu için eksik politikalar
CREATE POLICY "Kullanıcılar kendi müşterilerinin servis geçmişi oluşturabilir"
ON service_history FOR INSERT
WITH CHECK (appointment_id IN (
  SELECT id FROM appointments WHERE customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis geçmişini güncelleyebilir"
ON service_history FOR UPDATE
USING (appointment_id IN (
  SELECT id FROM appointments WHERE customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis geçmişini silebilir"
ON service_history FOR DELETE
USING (appointment_id IN (
  SELECT id FROM appointments WHERE customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
));

-- SERVICE_ITEMS tablosu için eksik politikalar
CREATE POLICY "Kullanıcılar kendi müşterilerinin servis kalemlerini görebilir"
ON service_items FOR SELECT
USING (service_history_id IN (
  SELECT sh.id FROM service_history sh
  JOIN appointments a ON sh.appointment_id = a.id
  JOIN customers c ON a.customer_id = c.id
  WHERE c.user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis kalemlerini oluşturabilir"
ON service_items FOR INSERT
WITH CHECK (service_history_id IN (
  SELECT sh.id FROM service_history sh
  JOIN appointments a ON sh.appointment_id = a.id
  JOIN customers c ON a.customer_id = c.id
  WHERE c.user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis kalemlerini güncelleyebilir"
ON service_items FOR UPDATE
USING (service_history_id IN (
  SELECT sh.id FROM service_history sh
  JOIN appointments a ON sh.appointment_id = a.id
  JOIN customers c ON a.customer_id = c.id
  WHERE c.user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis kalemlerini silebilir"
ON service_items FOR DELETE
USING (service_history_id IN (
  SELECT sh.id FROM service_history sh
  JOIN appointments a ON sh.appointment_id = a.id
  JOIN customers c ON a.customer_id = c.id
  WHERE c.user_id = auth.uid()
)); 