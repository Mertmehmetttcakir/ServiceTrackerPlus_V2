-- Jobs tablosu için RLS politikaları

-- RLS'yi etkinleştir
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Jobs için politikalar
CREATE POLICY "Kullanıcılar kendi müşterilerinin işlerini görebilir"
ON jobs FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler ve teknisyenler tüm işleri görebilir"
ON jobs FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'technician'));

CREATE POLICY "Kullanıcılar kendi müşterileri için iş oluşturabilir"
ON jobs FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler iş oluşturabilir"
ON jobs FOR INSERT
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Kullanıcılar kendi müşterilerinin işlerini güncelleyebilir"
ON jobs FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler ve teknisyenler tüm işleri güncelleyebilir"
ON jobs FOR UPDATE
USING (get_user_role(auth.uid()) IN ('admin', 'technician'));

CREATE POLICY "Yöneticiler iş silebilir"
ON jobs FOR DELETE
USING (get_user_role(auth.uid()) = 'admin');

-- Financial transactions tablosu için RLS politikaları (eğer varsa)
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi müşterilerinin finansal işlemlerini görebilir"
ON financial_transactions FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler tüm finansal işlemleri görebilir"
ON financial_transactions FOR SELECT
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Kullanıcılar kendi müşterileri için finansal işlem oluşturabilir"
ON financial_transactions FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler finansal işlem oluşturabilir"
ON financial_transactions FOR INSERT
WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Kullanıcılar kendi müşterilerinin finansal işlemlerini güncelleyebilir"
ON financial_transactions FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler tüm finansal işlemleri güncelleyebilir"
ON financial_transactions FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin'); 