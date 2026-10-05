-- Jobs tablosu için eksik RLS politikalarını güvenli şekilde ekle

-- Önce mevcut politikaları kontrol et ve sadece yoksa ekle
DO $$
BEGIN
    -- Jobs tablosu için INSERT politikası
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'jobs' 
        AND policyname = 'Kullanıcılar kendi müşterileri için iş oluşturabilir'
    ) THEN
        CREATE POLICY "Kullanıcılar kendi müşterileri için iş oluşturabilir"
        ON jobs FOR INSERT
        WITH CHECK (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;

    -- Jobs tablosu için UPDATE politikası
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'jobs' 
        AND policyname = 'Kullanıcılar kendi müşterilerinin işlerini güncelleyebilir'
    ) THEN
        CREATE POLICY "Kullanıcılar kendi müşterilerinin işlerini güncelleyebilir"
        ON jobs FOR UPDATE
        USING (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;

    -- Jobs tablosu için DELETE politikası
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'jobs' 
        AND policyname = 'Kullanıcılar kendi müşterilerinin işlerini silebilir'
    ) THEN
        CREATE POLICY "Kullanıcılar kendi müşterilerinin işlerini silebilir"
        ON jobs FOR DELETE
        USING (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;

    -- Financial transactions için INSERT politikası
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'financial_transactions' 
        AND policyname = 'Kullanıcılar kendi müşterileri için finansal işlem oluşturabilir'
    ) THEN
        CREATE POLICY "Kullanıcılar kendi müşterileri için finansal işlem oluşturabilir"
        ON financial_transactions FOR INSERT
        WITH CHECK (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;

    -- Financial transactions için UPDATE politikası
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'financial_transactions' 
        AND policyname = 'Kullanıcılar kendi müşterilerinin finansal işlemlerini güncelleyebilir'
    ) THEN
        CREATE POLICY "Kullanıcılar kendi müşterilerinin finansal işlemlerini güncelleyebilir"
        ON financial_transactions FOR UPDATE
        USING (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;

    -- Financial transactions için admin politikası
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'financial_transactions' 
        AND policyname = 'Adminler tüm finansal işlemleri yönetebilir'
    ) THEN
        CREATE POLICY "Adminler tüm finansal işlemleri yönetebilir"
        ON financial_transactions FOR ALL
        USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);
    END IF;

END $$; 