-- Kullanıcı Profilleri Güvenlik ve Senkronizasyon Scripti
-- Amaç:
-- 1. Kullanıcıların kendi rollerini (role) 'admin' olarak değiştirmesini engellemek.
-- 2. user_profiles tablosundaki 'role' değişimlerini auth.users metadata'sına senkronize etmek (JWT optimizasyonu için).

-- 1. ROL DEĞİŞİKLİĞİNİ ENGELLEME TRIGGER'I
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER AS $$
DECLARE
  requesting_user_role text;
BEGIN
  -- Eğer rol değişmiyorsa işleme izin ver
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Rol değişiyorsa, değişikliği yapan kişinin admin olup olmadığına bak
  -- JWT claims üzerinden kontrol (optimize-rls.sql sonrası)
  requesting_user_role := COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text
  );

  -- Eğer yapan kişi admin ise izin ver
  IF requesting_user_role = 'admin' THEN
    RETURN NEW;
  END IF;
  
  -- Admin değilse ve service_role değilse engelle
  -- (Supabase service_role key ile yapılan işlemlerde auth.jwt() null olabilir veya role 'service_role' olabilir)
  IF (auth.jwt() ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Rolünüzü değiştirme yetkiniz bulunmamaktadır.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_role_change ON public.user_profiles;

CREATE TRIGGER check_role_change
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_role_change();


-- 2. ROLÜ JWT CLAIM'E SENKRONİZE ETME TRIGGER'I
CREATE OR REPLACE FUNCTION public.sync_user_role_to_claims()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer rol değiştiyse veya yeni kayıt ise auth.users tablosunu güncelle
  -- Bu işlem SECURITY DEFINER ile çalışmalı çünkü auth şemasına erişim gerektirir
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.user_profiles;

CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_to_claims();


-- 3. MEVCUT KULLANICILARI SENKRONİZE ET (BİR KERELİK)
DO $$
DECLARE
  profile record;
BEGIN
  FOR profile IN SELECT * FROM public.user_profiles
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', profile.role)
    WHERE id = profile.id;
  END LOOP;
END;
$$;

