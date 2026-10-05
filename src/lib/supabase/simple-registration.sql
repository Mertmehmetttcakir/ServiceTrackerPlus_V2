-- Tüm RLS politikalarını geçici olarak devre dışı bırak
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Basit INSERT politikası
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
CREATE POLICY "Enable insert for authenticated users only"
ON user_profiles FOR INSERT
WITH CHECK (true);

-- Basit SELECT politikası
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
CREATE POLICY "Enable read access for all users"
ON user_profiles FOR SELECT
USING (true);

-- RLS'yi tekrar etkinleştir
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY; 