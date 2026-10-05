# Row Level Security (RLS) Kurulum Rehberi

Bu rehber, ServiceTracker Plus uygulamasında kullanıcı bazlı veri erişim kontrolü sağlamak için gerekli veritabanı değişikliklerini açıklar.

## Sorun

Şu anda farklı kullanıcılarla giriş yapıldığında aynı müşteriler görünüyor. Bu durum, Row Level Security (RLS) politikalarının henüz tam olarak uygulanmamış olmasından kaynaklanıyor.

## Çözüm

Aşağıdaki adımları takip ederek sorunu çözebilirsiniz:

### 1. Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin
3. Sol menüden "SQL Editor" seçeneğine tıklayın

### 2. Veritabanı Güncellemelerini Uygulama

`src/lib/supabase/database-updates.sql` dosyasındaki SQL kodlarını Supabase SQL Editor'da çalıştırın:

```sql
-- 1. Customers tablosuna user_id alanı ekleme
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. View'i güncelleme
DROP VIEW IF EXISTS customers_extended_details;
CREATE VIEW customers_extended_details AS
SELECT 
    c.id,
    c.user_id,
    c.full_name,
    c.email,
    c.phone,
    c.address,
    c.created_at as customer_created_at,
    c.updated_at as customer_updated_at,
    MAX(a.appointment_date) as last_appointment_date,
    COALESCE(SUM(ft.remaining_balance_for_job), 0) as total_outstanding_balance_from_jobs
FROM customers c
LEFT JOIN appointments a ON c.id = a.customer_id
LEFT JOIN (
    SELECT 
        j.customer_id,
        j.id as job_id,
        j.total_cost - COALESCE(SUM(ft.amount), 0) as remaining_balance_for_job
    FROM jobs j
    LEFT JOIN financial_transactions ft ON j.id = ft.job_id AND ft.transaction_type = 'PAYMENT'
    GROUP BY j.id, j.customer_id, j.total_cost
) ft ON c.id = ft.customer_id
GROUP BY c.id, c.user_id, c.full_name, c.email, c.phone, c.address, c.created_at, c.updated_at;
```

### 3. RLS Politikalarını Uygulama

**ÖNEMLİ:** Eğer daha önce RLS politikaları oluşturduysanız, `src/lib/supabase/rls-policies-update.sql` dosyasını kullanın. Bu dosya mevcut politikaları silip yeniden oluşturur.

Yeni kurulum için: `src/lib/supabase/rls-policies.sql`
Güncelleme için: `src/lib/supabase/rls-policies-update.sql`

### 4. Trigger Fonksiyonunu Oluşturma

Kullanıcı kaydı sırasında otomatik profil oluşturma için:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Test Etme

1. Uygulamayı yeniden başlatın
2. Farklı roller ile yeni kullanıcılar oluşturun:
   - **Admin**: Tüm müşterileri görebilir ve yönetebilir
   - **Teknisyen**: Tüm müşterileri görebilir ancak sınırlı yönetim yetkisi vardır
   - **Müşteri**: Sadece kendi verilerini görebilir

3. Her kullanıcı türü ile giriş yaparak erişim kontrollerini test edin

## Kullanıcı Rolleri

### Admin
- Tüm müşterileri görüntüleyebilir
- Müşteri oluşturabilir, düzenleyebilir ve silebilir
- Tüm sistem özelliklerine erişebilir

### Teknisyen
- Tüm müşterileri görüntüleyebilir
- Randevuları yönetebilir
- Servis kayıtlarını güncelleyebilir

### Müşteri
- Sadece kendi bilgilerini görüntüleyebilir
- Kendi araçlarını yönetebilir
- Kendi randevularını görüntüleyebilir

## Mevcut Veriler

Eğer sistemde zaten müşteri verileri varsa, bunları belirli kullanıcılara atamak için:

```sql
-- Örnek: Tüm mevcut müşterileri belirli bir admin kullanıcısına atama
UPDATE customers 
SET user_id = 'ADMIN_USER_ID_BURAYA' 
WHERE user_id IS NULL;
```

## Sorun Giderme

### Müşteriler Görünmüyor
- RLS politikalarının doğru uygulandığından emin olun
- Kullanıcının doğru role sahip olduğunu kontrol edin
- Browser cache'ini temizleyin

### Yetki Hatası
- `user_profiles` tablosunda kullanıcının kaydının olduğunu kontrol edin
- Kullanıcının rolünün doğru atandığından emin olun

### Performans Sorunları
- Veritabanı indekslerinin oluşturulduğunu kontrol edin
- View'lerin optimize edildiğinden emin olun

## Güvenlik Notları

- RLS politikaları veritabanı seviyesinde güvenlik sağlar
- API seviyesinde ek kontroller de mevcuttur
- Kullanıcı rolleri değiştirildiğinde oturum yenilenmesi gerekebilir

Bu değişiklikler uygulandıktan sonra, farklı kullanıcılar sadece yetkili oldukları verileri görebileceklerdir. 