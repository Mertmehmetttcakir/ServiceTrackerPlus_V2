-- Vehicles tablosu için mevcut RLS politikalarını kontrol et
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'vehicles'; 