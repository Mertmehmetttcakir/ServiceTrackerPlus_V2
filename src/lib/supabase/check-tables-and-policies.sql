-- Mevcut tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Jobs tablosunun yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Financial_transactions tablosunun varlığını kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'financial_transactions' AND table_schema = 'public';

-- Mevcut RLS politikalarını listele
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Jobs tablosu için mevcut RLS politikalarını kontrol et
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'jobs';

-- RLS'nin etkin olup olmadığını kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 