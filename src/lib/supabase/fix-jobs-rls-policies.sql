-- Jobs tablosu için eksik RLS politikalarını ekle

-- Normal kullanıcılar kendi müşterileri için iş oluşturabilir
CREATE POLICY "Kullanıcılar kendi müşterileri için iş oluşturabilir"
ON jobs FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- Normal kullanıcılar kendi müşterilerinin işlerini güncelleyebilir
CREATE POLICY "Kullanıcılar kendi müşterilerinin işlerini güncelleyebilir"
ON jobs FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- Normal kullanıcılar kendi müşterilerinin işlerini silebilir
CREATE POLICY "Kullanıcılar kendi müşterilerinin işlerini silebilir"
ON jobs FOR DELETE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- Financial transactions için de aynı politikaları ekle
CREATE POLICY "Kullanıcılar kendi müşterileri için finansal işlem oluşturabilir"
ON financial_transactions FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin finansal işlemlerini görebilir"
ON financial_transactions FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin finansal işlemlerini güncelleyebilir"
ON financial_transactions FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Adminler tüm finansal işlemleri yönetebilir"
ON financial_transactions FOR ALL
USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text); 