# ServiceTracker Plus - Proje İlerleme Takibi

## Proje Genel Bakış
ServiceTracker Plus, otomotiv servis işletmeleri için modern ve kapsamlı bir yönetim sistemidir.

### Temel Özellikler
- Müşteri Yönetimi: Müşteri verileri ve tarihçe yönetimi
- İş/Servis Takibi: Randevu ve teknisyen yönetimi
- Finansal Yönetim: Fatura ve ödeme takibi
- Raporlama: Performans ve müşteri memnuniyeti analizi
- Kullanıcı Arayüzü: Sezgisel modern tasarım

### Teknik Stack
- Platform: Web Tabanlı
- Frontend: React 18 + Vite
- UI: Chakra UI
- State: React Query + Context API (Redux/Zustand kullanılmıyor)
- API: React Query (TanStack)
- Stil: Chakra UI System
- Backend: Supabase
- Veritabanı: PostgreSQL (Supabase)
- Auth: Supabase Auth

## Proje Durum Özeti

### Hızlı Durum
- Proje Başlangıç: 01.03.2024
- Mevcut Faz: Temel Altyapı Geliştirme
- Genel İlerleme: 35%
- Sonraki Milestone: Backend API Entegrasyonu
- Mevcut Sprint: Sprint 2
- Son Sürüm: v0.2.0

### Temel Metrikler
- Tamamlanan Özellikler: 5/12
- Açık İssue'lar: 6
- Test Kapsamı: 65%
- Performans Skoru: 85/100
- Güvenlik Skoru: 90/100

## Geliştirme Fazları

### 1. Proje Kurulumu [Durum: TAMAMLANDI]
#### Tamamlanan
- [x] Repository oluşturma
- [x] Geliştirme ortamı kurulumu
- [x] CI/CD pipeline yapılandırması
- [x] Dokümantasyon yapısı
- [x] Başlangıç mimari tasarımı

### 2. Temel Altyapı [Durum: DEVAM EDİYOR]
#### Tamamlanan
- [x] Temel proje yapısı
- [x] Veritabanı şeması
- [x] API temelleri
- [x] Kimlik doğrulama sistemi
  - Login sayfası
  - Auth servisi
  - Protected route yapısı
  - Token yönetimi
  - Token yenileme mekanizması
  - Rol tabanlı yetkilendirme
- [x] Temel UI bileşenleri
  - Header
  - Sidebar
  - Layout yapısı
- [x] Test altyapısı
  - Vitest kurulumu
  - Jest DOM entegrasyonu
  - React Testing Library kurulumu
  - İlk test dosyaları (Auth)
- [x] Önbellekleme sistemi
  - React Query kurulumu
  - Önbellekleme yapılandırması
  - Query Client Provider entegrasyonu

#### Devam Eden
- [x] Supabase Entegrasyonu
  - [x] Temel yapılandırma
    - [x] Supabase istemci kütüphanesi kurulumu
    - [x] Supabase istemci yapılandırması
    - [x] Auth Provider oluşturulması
  - [x] Veritabanı tabloları
    - [x] Tablo şemalarının oluşturulması
    - [x] İlişkilerin tanımlanması
    - [x] Trigger'ların oluşturulması
    - [x] RLS politikalarının tanımlanması
  - [x] Auth Entegrasyonu
    - [x] Login sayfasının Supabase Auth ile entegrasyonu
    - [x] Google OAuth callback sayfası
    - [x] Kayıt sayfasının oluşturulması
    - [x] Şifre sıfırlama akışı
    - [x] Kullanıcı profil yönetimi
  - [x] Güvenlik yapılandırması
    - [x] RLS politikalarının güncellenmesi
    - [x] API güvenliği
    - [x] Dosya yükleme güvenliği
    - [x] Oturum yönetimi
    - [x] Hata yakalama ve loglama
  - [x] API servislerinin güncellenmesi
    - [x] BaseApiService sınıfı oluşturuldu
    - [x] CustomerService güncellendi
    - [x] VehicleService güncellendi
    - [x] AppointmentService güncellendi
    - [x] ServiceHistoryService güncellendi

#### Sıradaki
- [ ] Hata izleme mekanizması

### 3. Özellik Geliştirme [Durum: DEVAM EDİYOR]
#### Temel Özellikler
- [x] Müşteri Yönetimi
  - İlerleme: 100%
  - Tamamlanan: 
    - Arama, filtreleme, temel CRUD işlemleri
    - Müşteri detay sayfası
    - Araç yönetimi
    - Randevu yönetimi
    - Servis geçmişi görünümü
  - Kalan: 
    - Gelişmiş raporlama özellikleri

- [x] Servis Takibi
  - İlerleme: 95%
  - Tamamlanan: 
    - Randevu listesi
    - Randevu filtreleme
    - Randevu form yapısı
    - Takvim görünümü geliştirildi (Chakra Grid ile custom takvim)
    - Randevu durumu gösterimi
    - Teknisyen bilgisi entegrasyonu
    - Teknisyen atama modal arayüzü
    - Teknisyen tip tanımlamaları
    - Teknisyen atama backend entegrasyonu
    - Servis detay sayfası temel yapısı
    - Araç servis geçmişi görünümü
    - Teknisyen notları düzenleme özelliği
    - PDF servis raporu oluşturma ve indirme
    - PDF önizleme ve yönetim arayüzü
  - Kalan: 
    - Gelişmiş randevu yönetimi (Realtime güncellemeler)

#### Ek Özellikler
- [ ] SMS Bildirimleri
  - Öncelik: Orta
  - Durum: Başlamadı

- [x] Finansal Yönetim ve Raporlama
  - Öncelik: Yüksek
  - Durum: TAMAMLANDI. 
    - Müşteri detay ve İş detay sayfalarına ödeme alma (PaymentModal) entegre edildi.
    - Kasa / Finans (Finance Dashboard) sayfası oluşturuldu.
    - Tedarikçiler ve Giderler (Suppliers) modülü eklendi, borç/ödeme takibi aktifleştirildi.
    - Tedarikçi işlemleri için filtreleme ve tarih seçme özellikleri getirildi.

### 4. Test ve Kalite [Durum: DEVAM EDİYOR]
#### Unit Testing
- [x] Core bileşenler
- [ ] API servisleri
- [ ] State yönetimi

#### Entegrasyon Testleri
- [ ] API entegrasyonu
- [ ] Veritabanı işlemleri
- [ ] Kullanıcı akışları

### 5. Deployment ve Launch [Durum: PLANLAMADA]
#### Ortam Kurulumları
- [x] Development
- [ ] Staging
- [ ] Production

## Supabase Entegrasyonu Detaylı Planı

### 1. Proje Kurulumu ve Yapılandırma
- [ ] Supabase Projesi Oluşturma
  - [ ] Dashboard üzerinde yeni proje oluşturma
  - [ ] Veritabanı bölgesi (region) seçimi
  - [ ] Veritabanı şifresi oluşturma
- [ ] Ortam Ayarları
  - [ ] API URL ve anahtarları (keys) .env dosyasına ekleme
  - [ ] Development ve production ortamları için ayrı projeler
- [ ] İstemci Kütüphanelerinin Kurulumu
  - [ ] @supabase/supabase-js kurulumu
  - [ ] @supabase/auth-helpers-react (opsiyonel) kurulumu
  - [ ] İstemci yapılandırma dosyası (supabaseClient.ts) oluşturulması

### 2. Veritabanı Şema Tasarımı ve Uygulaması
- [ ] Veri Modeli
  - [ ] Tabloların oluşturulması
    - [ ] users (Auth tarafından otomatik oluşturulacak)
    - [ ] customers
    - [ ] vehicles (customer ile ilişkili)
    - [ ] appointments (customer ve vehicle ile ilişkili)
    - [ ] service_history (appointment ile ilişkili)
    - [ ] service_items (service_history ile ilişkili)
    - [ ] technicians
    - [ ] reports
  - [ ] İlişkilerin (Foreign Keys) Ayarlanması
    - [ ] vehicles -> customers
    - [ ] appointments -> customers, vehicles, technicians
    - [ ] service_history -> appointments, vehicles
  - [ ] İndeksler ve kısıtlamalar
    - [ ] Tekil (unique) kısıtlamalar (örn. plaka numarası)
    - [ ] Zorunlu alanlar (NOT NULL)
- [ ] Trigger Fonksiyonları
  - [ ] created_at/updated_at alanları için otomatik güncelleme
  - [ ] Randevu durumu değiştiğinde bildirim gönderimi
  - [ ] Müşteri veya araç silindiğinde ilişkili kayıtların güncellenmesi

### 3. Güvenlik Yapılandırması
- [ ] Row Level Security (RLS) Kuralları
  - [ ] users: Kendi profillerini görebilir/düzenleyebilir
  - [ ] customers: Yetkilendirme bazlı erişim
  - [ ] vehicles, appointments: Müşteri ilişkisine göre erişim
- [ ] Rollerin Tanımlanması
  - [ ] admin: Tam erişim
  - [ ] manager: Sınırlı yönetim erişimi
  - [ ] technician: Servis ile ilgili kayıtlara erişim
  - [ ] customer: Kendi kayıtlarına erişim
- [ ] SQL Fonksiyonları ve Stored Procedure'lar
  - [ ] Karmaşık sorgulamalar için
  - [ ] İş mantığı için

### 4. Kimlik Doğrulama ve Yetkilendirme
- [ ] Auth Yapılandırması
  - [ ] E-posta/şifre kimlik doğrulama
  - [ ] Sosyal giriş (Google, Microsoft, vb.)
  - [ ] Doğrulama e-postaları şablonları
  - [ ] Şifre kurtarma akışı
- [ ] Yetkilendirme Akışı
  - [ ] JWT token yönetimi ve yenileme
  - [ ] Kullanıcı rolleri ve izinleri
  - [ ] AuthContext güncellenmesi
- [ ] Kullanıcı Profilleri
  - [ ] public.users tablosu ile auth.users bağlantısı
  - [ ] Profil bilgileri yönetimi
  - [ ] Avatar/resim yükleme ve depolama

### 5. API Servislerinin Entegrasyonu
- [ ] API Wrapper Oluşturma
  - [ ] supabase.ts dosyasının hazırlanması
  - [ ] Temel CRUD işlemleri için yardımcı fonksiyonlar
  - [ ] Hata yakalama mekanizmaları
- [ ] Servis Katmanının Güncellenmesi
  - [ ] customerService: Mock veri yerine Supabase sorgulamaları
  - [ ] vehicleService: İlişkili veri yapıları
  - [ ] appointmentService: Randevu ve takvim entegrasyonu
  - [ ] technicianService: Teknisyen yönetimi
  - [ ] authService: Kimlik doğrulama işlemleri
- [ ] Gerçek Zamanlı Veri İşlemleri
  - [ ] Realtime subscription kurulumu
  - [ ] Randevu güncellemeleri için dinleyiciler
  - [ ] Kullanıcı bildirimlerinin gösterilmesi

### 6. Veri Senkronizasyonu ve Önbellek
- [ ] React Query Optimizasyonları
  - [ ] invalidateQueries stratejileri
  - [ ] staleTime yapılandırmaları
  - [ ] Optimistik güncellemeler
- [ ] Çevrimdışı Destek
  - [ ] Yerel depolama (localStorage/IndexedDB)
  - [ ] Çevrimdışı işlemlerin senkronizasyonu
  - [ ] Çakışma çözümleme stratejileri

### 7. Depolama ve Dosya Yönetimi
- [ ] Storage Bucket Yapılandırması
  - [ ] Profilresimleri bucket'ı
  - [ ] Servis raporları ve belgeler bucket'ı
  - [ ] Araç fotoğrafları bucket'ı
- [ ] Dosya İşleme Servisleri
  - [ ] Resim yükleme ve optimizasyon
  - [ ] PDF oluşturma ve depolama
  - [ ] Dosya paylaşım mekanizmaları

### 8. Performans ve İzleme
- [ ] Sorgu Optimizasyonu
  - [ ] İndeks analizi ve optimizasyon
  - [ ] Karmaşık sorguların incelenmesi
  - [ ] Sayfalama ve filtreleme optimizasyonu
- [ ] İzleme Mekanizmaları
  - [ ] Sorgu performansı izleme
  - [ ] Hata ve dışa aktarma (logging)
  - [ ] Kullanıcı eylemleri analizi

### 9. Yedekleme ve Veri Güvenliği
- [ ] Otomatik Yedeklemeler
  - [ ] Günlük tam yedeklemeler
  - [ ] Point-in-time recovery yapılandırması
- [ ] Veri Arşivleme
  - [ ] Eski kayıtların arşivlenmesi
  - [ ] Geçmiş veri analizleri

### 10. Deployment ve Erişim Kontrolü
- [ ] Staging ve Production Ortamları
  - [ ] Farklı Supabase projeleri
  - [ ] Ortam değişkenlerinin ayrıştırılması
  - [ ] CI/CD entegrasyonu
- [ ] Erişim Kontrolü
  - [ ] API anahtarları yönetimi
  - [ ] IP kısıtlamaları (gerekirse)
  - [ ] Ekip üyeleri için rol tabanlı erişim

## Zaman Çizelgesi ve Mihenk Taşları

### Tamamlanan Mihenk Taşları
1. Proje Başlangıcı: 01.03.2024
   - Başlangıç toplantısı
   - Teknik stack seçimi
   - Temel mimari kararlar

2. Temel Altyapı: 15.03.2024
   - Veritabanı şeması
   - API yapısı
   - Temel UI bileşenleri

### Gelecek Mihenk Taşları
1. Backend Entegrasyonu: 01.04.2024
   - Hedefler: API entegrasyonu, Auth sistemi, Supabase entegrasyonu
   - Riskler: API performans sorunları, veri bütünlüğü
   - Görevler:
     - Supabase projesinin kurulumu
     - Temel tabloların oluşturulması
     - Auth entegrasyonu
     - Temel CRUD servislerinin güncellenmesi

2. MVP Sürümü: 15.04.2024
   - Hedefler: Temel özelliklerin tamamlanması
   - Riskler: Test kapsamı yetersizliği

## Mevcut Sprint Detayları

### Sprint 2 (15.03.2024 - 29.03.2024)
#### Hedefler
- [x] Auth sistemi tamamlanması
- [x] Müşteri modülü temel özellikleri
- [x] Randevu yönetimi temel özellikleri
- [x] Teknisyen atama sistemi
- [x] Randevu tip ve adaptör düzenlemeleri
- [ ] Takvim entegrasyonu

#### Devam Eden
- Randevu Takvimi: @developer1 - 40%
- Randevu Yönetimi Detaylandırma: @developer2 - 30%

#### Tamamlanan
- Müşteri Yönetimi
- Auth Sistemi
- Randevu Liste Görünümü
- Filtreleme Sistemi
- Teknisyen Atama Sistemi
- Servis Detay Sayfası Geliştirmeleri
- PDF Rapor Oluşturma ve Yönetimi
- Randevu Adaptörleri Düzenlemesi

### Sonraki Sprint Hedefleri
- [x] Teknisyen yönetimi detaylandırma
- [ ] Takvim entegrasyonu detaylandırma
- [ ] Randevu yönetimi için gelişmiş özellikler ekleme
- [ ] Performans optimizasyonları

### Teknolojik Geliştirmeler
- Teknisyen yönetimi için detaylı tip ve hook yapısı oluşturuldu
- Takvim entegrasyonu için temel hook geliştirildi
- Supabase ile daha detaylı veri sorgulama ve filtreleme özellikleri eklendi

### Planlanan Geliştirmeler
- Araç Kabul (Check-up) ve Hasar Tespit Formu (Görsel hasar işaretleme ve kontrol listesi - İleri bir faza planlandı)
- Teknisyen atama sisteminin UI bileşenlerinin tamamlanması
- Takvim görünümü için React Big Calendar veya benzeri bir kütüphane entegrasyonu
- Randevu filtreleme ve gruplandırma özelliklerinin geliştirilmesi

## Riskler ve Önlemler

### Aktif Riskler
1. Risk: API Performans Sorunları
   - Etki: Yüksek
   - Olasılık: Orta
   - Önlem: Önbellekleme ve optimizasyon

2. Risk: Test Kapsamı Yetersizliği
   - Etki: Orta
   - Olasılık: Düşük
   - Önlem: Otomatik test süreçleri

3. Risk: Veri Bütünlüğü Sorunları
   - Etki: Yüksek
   - Olasılık: Düşük
   - Önlem: İlişkisel kısıtlamalar, trigger fonksiyonları, düzenli veri doğrulama

## Bağımlılıklar ve Engeller

### Dış Bağımlılıklar
- SMS API Servisi: Araştırma aşamasında
- Ödeme Sistemi: Planlanıyor
- Supabase: Temel hesap sınırlamaları

### İç Bağımlılıklar
- Auth Sistemi: Tamamlandı
- API Gateway: Planlanıyor
- Supabase Entegrasyonu: Devam ediyor

## Notlar ve Güncellemeler

### Son Güncellemeler
- 30.03.2024: Supabase Entegrasyonu planlaması eklendi
- 11.05.2024: Supabase veritabanı tabloları oluşturuldu
  - Tüm tablo şemaları oluşturuldu
  - İlişkiler ve kısıtlamalar tanımlandı
  - Trigger'lar ve RLS politikaları eklendi
- 11.05.2024: Supabase temel yapılandırması tamamlandı
  - Supabase istemci kütüphanesi kuruldu
  - Supabase istemci yapılandırması oluşturuldu
  - Auth Provider bileşeni oluşturuldu
- 29.03.2024: PDF servis raporu geliştirmeleri tamamlandı
  - PDF rapor oluşturma ve indirme servisleri eklendi
  - useServiceReport hook'u oluşturuldu
  - ServiceReportPreview bileşeni geliştirildi
  - PDF önizleme ve yönetim arayüzü eklendi
  - E-posta gönderme altyapısı için hazırlık yapıldı
- 28.03.2024: Servis detay sayfası geliştirmeleri tamamlandı
  - Araç servis geçmişi modülü eklendi (ServiceHistoryList)
  - Teknisyen notları düzenleme özelliği eklendi (TechnicianNotesEditor)
  - useVehicleServiceHistory hook'u oluşturuldu
  - serviceHistoryService'e yeni fonksiyonlar eklendi
  - useServiceDetail hook'una not güncelleme desteği eklendi
- 27.03.2024: Teknisyen atama backend entegrasyonu tamamlandı
  - Teknisyen servis sınıfı eklendi (technicianService)
  - Teknisyen verilerini yönetecek hook oluşturuldu (useTechnicians)
  - Teknisyen atama için özel hook eklendi (useAppointmentTechnician)
  - TechnicianAssignmentModal bileşeni güncellendi
  - useAppointments hook'una updateAppointmentTechnician fonksiyonu eklendi
- 26.03.2024: Müşteri düzenleme ve silme işlevleri geliştirildi
  - CustomerDetails bileşenine silme fonksiyonu eklendi
  - useCustomer hook'una silme işlevi eklendi
  - CustomerList bileşeninde silme işlemi güvenliği artırıldı (AlertDialog entegrasyonu)
  - Müşteri adlarına detay sayfası linkleri eklendi
  - Durum göstergeleri ve yükleme durumları iyileştirildi
  - Toast bildirimleri eklendi
- 02.10.2024: Finans ve Tedarikçi Modülleri Tamamlandı
  - Kasa / Finans genel yönetim sayfası (FinanceDashboard) oluşturuldu.
  - Supabase'e `suppliers` ve `supplier_transactions` tabloları eklendi.
  - Tedarikçi listeleme ve detay sayfası geliştirildi (Borç ve Ödeme ekleme, Filtreleme, Sıralama, Tarih seçimi).
  - React Query önbellek yönetimi ve Supabase servis entegrasyonu tamamlandı.
- 24.03.2024: Kimlik doğrulama ve backend bağlantıları geliştirmeleri
  - AuthContext ve useAuth hook'u oluşturuldu
  - Login, Register formları eklendi
  - API servisi ve interceptor'lar geliştirildi
  - Token yönetimi ve otomatik yenileme implementasyonu yapıldı
  - ProtectedRoute bileşeni eklendi
  - Dashboard sayfası oluşturuldu
  - Route yapısı düzenlendi
- 23.03.2024: Servis geçmişi geliştirmeleri
  - CustomerServiceHistory bileşeni oluşturuldu
  - ServiceRecord tipi tanımlandı
  - ServiceHistoryService servisi geliştirildi
  - useServiceHistory hook'u eklendi
  - Formatlama yardımcı fonksiyonları eklendi
- 21.03.2024: Müşteri listesi geliştirmeleri
  - Müşteri tipleri tanımlandı
  - Müşteri servisi oluşturuldu
  - Liste sayfası geliştirildi
  - Arama ve filtreleme eklendi
  - Sayfalama yapısı kuruldu
- 21.03.2024: Önbellekleme sistemi kurulumu
  - React Query entegrasyonu
  - Önbellekleme yapılandırması
  - Query Client Provider eklendi
- 21.03.2024: Test altyapısı kurulumu
  - Vitest ve React Testing Library entegrasyonu
  - Auth sistemi testleri
  - Test script'leri eklendi
- 20.03.2024: Auth sistemi geliştirmeleri
  - Login sayfası oluşturuldu
  - Auth servisi implementasyonu tamamlandı
  - Protected route yapısı eklendi
  - Token yönetimi eklendi
  - Header ve Sidebar bileşenleri oluşturuldu
- 20.03.2024: Teknisyen atama sistemi geliştirmeleri
  - Teknisyen atama modal arayüzü oluşturuldu
  - Teknisyen tip tanımlamaları tamamlandı
  - Randevu-Teknisyen ilişkisi kuruldu
- 20.03.2024: Randevu Takvimi geliştirmeleri tamamlandı
  - Randevu durumu gösterimi eklendi
  - Teknisyen bilgisi entegrasyonu yapıldı
  - Tooltip ile detaylı bilgi gösterimi eklendi
- 15.03.2024: Sprint 2 başladı
- 14.03.2024: Veritabanı şeması tamamlandı
- 22.03.2024: Müşteri detay sayfası geliştirmeleri
  - CustomerDetails bileşeni oluşturuldu
  - Araç yönetimi özellikleri eklendi
  - Vehicle tipi ve servisi tanımlandı
  - Araç form bileşeni geliştirildi
  - useCustomer ve useVehicles hookları eklendi
- 11.05.2024: Kullanıcı profil yönetimi tamamlandı
  - Profil sayfası oluşturuldu
  - Profil fotoğrafı yükleme özelliği eklendi
  - Profil bilgilerini güncelleme özelliği eklendi
  - Şifre değiştirme entegrasyonu yapıldı
- 11.05.2024: Şifre sıfırlama akışı tamamlandı
  - Şifre sıfırlama sayfası oluşturuldu
  - Şifre güncelleme sayfası oluşturuldu
  - Router yapılandırması güncellendi
- 11.05.2024: Kayıt sayfası oluşturuldu
  - Supabase Auth ile entegre edildi
  - Kullanıcı profili oluşturma eklendi
  - Form validasyonları eklendi
- 11.05.2024: Auth entegrasyonu başladı
  - Login sayfası Supabase Auth ile entegre edildi
  - Google OAuth callback sayfası oluşturuldu
  - Router yapılandırması güncellendi
- 11.05.2024: RLS politikaları güncellendi
  - Müşteri verileri için erişim politikaları
  - Araç verileri için erişim politikaları
  - Randevu verileri için erişim politikaları
  - Servis geçmişi için erişim politikaları
  - Teknisyen verileri için erişim politikaları
- 11.05.2024: API güvenliği eklendi
  - Auth middleware oluşturuldu
  - Rol bazlı yetkilendirme eklendi
  - Express Request tipi genişletildi
- 11.05.2024: Dosya yükleme güvenliği eklendi
  - StorageService sınıfı oluşturuldu
  - Dosya türü ve boyut kontrolleri eklendi
  - Güvenli dosya yükleme ve silme işlemleri
  - Hata yönetimi ve loglama
- 11.05.2024: Oturum yönetimi eklendi
  - SessionService sınıfı oluşturuldu
  - Oturum zaman aşımı kontrolü
  - Kullanıcı aktivite takibi
  - Otomatik oturum yenileme
  - Güvenli oturum sonlandırma
- 11.05.2024: Hata yakalama ve loglama altyapısı eklendi
  - ErrorLogger servisi oluşturuldu
  - Hata yakalama middleware'i eklendi
  - Özel HTTP hata sınıfı tanımlandı
  - 404 hata yakalayıcı eklendi
  - Supabase'de error_logs tablosu oluşturuldu
- 11.05.2024: API servisleri güncellendi
  - BaseApiService sınıfı oluşturuldu
  - Hata yönetimi ve loglama entegrasyonu
  - CustomerService Supabase ile entegre edildi
  - VehicleService Supabase ile entegre edildi
  - AppointmentService Supabase ile entegre edildi
  - ServiceHistoryService Supabase ile entegre edildi
  - CRUD operasyonları standardize edildi
  - İlişkisel sorgular eklendi

### Önemli Kararlar
- 10.03.2024: Redux yerine Zustand kullanımı düşünüldü ancak sonrasında tamamen **React Query + Context API** mimarisinde karar kılındı. (Redux kodları projeden temizlenecek).
- 05.03.2024: Mikroservis mimarisi ertelendi

### Sonraki Adımlar
1. Araç Kabul (Check-up) ve Hasar Tespit Formu Modülü (Tasarım ve Planlama Aşamasında)
2. Gelişmiş randevu yönetimi
3. E-posta bildirimleri
4. Test otomasyonunun geliştirilmesi

## Günlük Güncelleme Kontrol Listesi
- [ ] Sprint durumu kontrolü
- [ ] Açık issue'ların gözden geçirilmesi
- [ ] Test kapsamı kontrolü
- [ ] Performans metriklerinin güncellenmesi
- [ ] Risk değerlendirmesi
- [ ] Bağımlılık kontrolü 