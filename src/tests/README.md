# ServiceTracker Plus Test Rehberi

Bu dosya projenin test yapısını ve test çalıştırma yöntemlerini açıklamaktadır.

## Test Yapısı

```
src/tests/
├── setup.ts                    # Test ortamı kurulumu
├── testUtils.tsx               # Test yardımcı fonksiyonları
├── components/                 # Component testleri
│   ├── CustomerDetails.test.tsx
│   └── AppointmentList.test.tsx
├── hooks/                      # Hook testleri
│   └── useCustomers.test.ts
├── services/                   # Service testleri
│   └── customerService.test.ts
├── utils/                      # Utility testleri
│   └── dateUtils.test.ts
├── integration/                # Integration testleri
│   └── customerFlow.test.tsx
└── auth/                      # Auth testleri
    └── Login.test.tsx
```

## Test Türleri

### 1. Unit Testler
- **Bileşen Testleri**: React bileşenlerinin render edilmesi, prop'ların doğru çalışması
- **Hook Testleri**: Custom hook'ların state yönetimi ve side effect'leri
- **Service Testleri**: API çağrıları ve veri işleme fonksiyonları
- **Utility Testleri**: Yardımcı fonksiyonların doğru çalışması

### 2. Integration Testler
- **İş Akışı Testleri**: Kullanıcı senaryolarının baştan sona test edilmesi
- **Component Entegrasyonu**: Birden fazla bileşenin birlikte çalışması

### 3. E2E Testler (Planlanan)
- **Kullanıcı Senaryoları**: Gerçek tarayıcı ortamında tam iş akışları

## Test Komutları

```bash
# Tüm testleri çalıştır
npm run test

# Watch modunda test çalıştır
npm run test:watch

# Coverage raporu ile test çalıştır
npm run test:coverage

# Belirli bir test dosyasını çalıştır
npm run test -- CustomerDetails.test.tsx

# Belirli bir test paketini çalıştır
npm run test -- --run src/tests/components/
```

## Test Yazma Kuralları

### 1. Test Dosya İsimlendirme
- Bileşen testleri: `ComponentName.test.tsx`
- Hook testleri: `useHookName.test.ts`
- Service testleri: `serviceName.test.ts`
- Utility testleri: `utilityName.test.ts`

### 2. Test Yapısı
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Her testten önce çalışacak setup
  });

  describe('özellik grubu', () => {
    it('spesifik davranışı test eder', () => {
      // Test implementasyonu
    });
  });
});
```

### 3. Test İsimlendirme
- Türkçe açıklayıcı isimler kullanın
- Ne test edildiğini net bir şekilde belirtin
- "renders", "shows", "handles" gibi eylem odaklı isimler

### 4. Mock Kullanımı
```typescript
// Supabase mock
vi.mock('../../lib/supabase', () => ({
  supabase: createMockSupabaseClient(),
}));

// React Router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

## Test Veri Yönetimi

### Mock Data
- `src/__mocks__/` klasöründe test verileri
- Her veri tipi için ayrı mock dosyası
- Gerçekçi test verileri kullanın

### Test Utilities
- `testUtils.tsx` dosyasında ortak test fonksiyonları
- Provider wrapper'ları
- Mock factory fonksiyonları

## Coverage Hedefleri

- **Overall Coverage**: >80%
- **Component Coverage**: >85%
- **Service Coverage**: >90%
- **Utility Coverage**: >95%

## Test Ortamı

### Teknolojiler
- **Test Runner**: Vitest
- **Testing Library**: @testing-library/react
- **Mock Library**: Vitest vi functions
- **Test Environment**: jsdom

### Konfigürasyon
- `vitest.config.ts`: Ana konfigürasyon
- `src/tests/setup.ts`: Test ortamı kurulumu

## Debugging

### Test Debug Etme
```bash
# Debug mode
npm run test -- --inspect-brk

# Console log'ları görmek için
npm run test -- --reporter=verbose
```

### Common Issues
1. **Async Operations**: `waitFor` kullanın
2. **User Events**: `userEvent.setup()` ile başlatın
3. **Timers**: `vi.useFakeTimers()` ile kontrol edin

## En İyi Pratikler

### 1. Test Yazma
- AAA pattern: Arrange, Act, Assert
- Her test bir şeyi test etmeli
- Test'ler birbirinden bağımsız olmalı

### 2. Mock Strategy
- Dış bağımlılıkları mock'layın
- Gerçek davranışı simüle edin
- Mock'ları test sonrası temizleyin

### 3. Performance
- Gereksiz re-render'ları önleyin
- Heavy setup'ları beforeAll'da yapın
- Test parallelization kullanın

### 4. Accessibility
- ARIA label'larını test edin
- Keyboard navigation'ı test edin
- Screen reader uyumluluğunu kontrol edin

## Test Metrikleri

### Coverage Reports
Coverage raporları `coverage/` klasöründe oluşturulur:
- `index.html`: Ana rapor
- `lcov.info`: CI/CD entegrasyonu için

### Test Results
Test sonuçları console'da ve CI/CD sistemlerinde görüntülenir.

## CI/CD Entegrasyonu

Tests GitHub Actions ile otomatik çalıştırılır:
```yaml
- name: Run Tests
  run: npm run test:coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v1
```

## Sorun Giderme

### Sık Karşılaşılan Hatalar
1. **Module not found**: Import path'lerini kontrol edin
2. **Async timeouts**: waitFor timeout değerini artırın
3. **Mock issues**: Mock implementation'ı kontrol edin

### Debug Resources
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Guide](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/testing-implementation-details) 