-- 1. customers tablosuna created_by_admin_id sütununu ekle
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Bu sütun için bir indeks oluşturmak performansı artırabilir
CREATE INDEX IF NOT EXISTS idx_customers_created_by_admin_id ON public.customers(created_by_admin_id);

-- Mevcut RLS politikalarını kaldır (varsa)
-- DİKKAT: Bu komutlar mevcut tüm politikaları kaldırır. 
-- Eğer belirli politikaları korumak istiyorsanız, onları burada listelemeyin veya DROP POLICY IF EXISTS kullanın.
DROP POLICY IF EXISTS "Yöneticiler tüm müşterilere erişebilir" ON public.customers;
DROP POLICY IF EXISTS "Teknisyenler tüm müşterilere erişebilir" ON public.customers;
DROP POLICY IF EXISTS "Müşteriler kendi bilgilerine erişebilir" ON public.customers;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşteri kayıtlarını görebilir" ON public.customers;
DROP POLICY IF EXISTS "Giriş yapmış kullanıcılar müşteri ekleyebilir" ON public.customers;

-- Yeni RLS Politikaları

-- Genel Kural: public.user_profiles tablosundan rolü çekmek için bir fonksiyon
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yöneticiler (admin) için RLS politikaları
CREATE POLICY "Adminler kendi ekledikleri müşterileri yönetebilir" ON public.customers
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin' AND created_by_admin_id = auth.uid())
  WITH CHECK (get_user_role(auth.uid()) = 'admin' AND created_by_admin_id = auth.uid());

-- Eğer bir adminin TÜM müşterileri görmesini istiyorsanız (kendi eklemediklerini de),
-- ama sadece kendi eklediklerini düzenleyip silebilmesini istiyorsanız, ayrı SELECT politikası gerekebilir.
-- Şimdilik sadece kendi eklediklerini görebilirler.

-- Teknisyenler (technician) için RLS politikaları
-- Teknisyenlerin ŞİMDİLİK tüm müşterileri görmesine izin verelim (sadece SELECT).
-- Düzenleme/Silme işlemleri için daha kısıtlı politikalar eklenebilir.
CREATE POLICY "Teknisyenler tüm müşterileri görebilir" ON public.customers
  FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'technician');
  
-- Müşteriler (customer) için RLS politikaları
-- Müşteriler, eğer customers.user_id alanı kendi auth.uid() ile eşleşiyorsa ilgili müşteri kaydını görebilir.
CREATE POLICY "Müşteriler kendi profilini görebilir (eğer user_id eşleşiyorsa)" ON public.customers
  FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'customer' AND user_id = auth.uid());

-- Müşteri ekleme (INSERT) politikası
-- Yalnızca admin rolündeki kullanıcılar müşteri ekleyebilir.
-- created_by_admin_id otomatik olarak auth.uid() ile dolacaktır.
CREATE POLICY "Adminler müşteri ekleyebilir" ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Güvenlik duvarı: Hiçbir koşula uymayanlar için varsayılan olarak reddet
-- Bu genellikle RLS etkinleştirildiğinde varsayılan davranıştır ama açıkça belirtmek iyi olabilir.
-- CREATE POLICY "Default deny" ON public.customers
--  FOR ALL
--  TO public
--  USING (false); 

-- RLS'i customers tablosu için etkinleştir (zaten etkinse hata vermez)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- user_profiles tablosundaki SELECT politikası (herkesin kendi profilini görmesi için)
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini görebilir" ON public.user_profiles;
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- user_profiles tablosundaki UPDATE politikası (herkesin kendi profilini güncellemesi için)
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini güncelleyebilir" ON public.user_profiles;
CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());


SELECT 'RLS politikaları ve customers tablosu başarıyla güncellendi.' AS status_message; 