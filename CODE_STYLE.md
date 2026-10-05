# ServiceTracker Plus Kod Stil Rehberi

## Proje Genel Bakış
ServiceTracker Plus, otomotiv servis işletmeleri için geliştirilmiş kapsamlı bir yönetim sistemidir.

### Temel Özellikler
- Müşteri Yönetimi: Müşteri verileri ve geçmiş işlem kayıtları
- İş/Servis Takibi: Randevu ve teknisyen yönetimi
- Finansal Yönetim: Fatura ve ödeme takibi
- Raporlama: Performans ve müşteri memnuniyeti analizi
- Kullanıcı Arayüzü: Sezgisel ve modern tasarım

### Teknik Stack
- Platform: Web Tabanlı
- Frontend: React
- UI Kütüphaneleri: MUI, Tailwind, Chakra UI
- State Yönetimi: Redux, Zustand
- Stil Çözümleri: styled-components
- API Yönetimi: react-query

## 1. Dosya Organizasyonu

### Dizin Yapısı
```
src/
├── components/
│   ├── common/
│   ├── features/
│   └── layouts/
├── hooks/
├── pages/
├── services/
├── store/
├── types/
└── utils/
```

### Dosya İsimlendirme
- Bileşenler: PascalCase (örn. `CustomerDetails.tsx`)
- Hooklar: camelCase, use prefix (örn. `useCustomerData.ts`)
- Yardımcı fonksiyonlar: camelCase (örn. `formatDate.ts`)
- Stil dosyaları: ComponentName.styles.ts

## 2. Kod Formatı

### Genel Kurallar
- Girinti: 2 boşluk
- Maksimum satır uzunluğu: 80 karakter
- Tek tırnak kullanımı
- Noktalı virgül zorunlu
- Trailing comma kullanımı

### Örnek Format
```typescript
import React from 'react';
import { useCustomerData } from '@/hooks';
import { Button } from '@/components/common';

interface CustomerProps {
  id: string;
  name: string;
}

export const CustomerCard: React.FC<CustomerProps> = ({
  id,
  name,
}) => {
  return (
    <div className="customer-card">
      <h2>{name}</h2>
    </div>
  );
};
```

## 3. İsimlendirme Kuralları

### Değişkenler
- camelCase kullanımı
- Açıklayıcı isimler
- Boolean değişkenler için is/has prefix

```typescript
const customerName = 'Ahmet';
const isActive = true;
const hasPermission = false;
```

### Bileşenler
- PascalCase
- Açıklayıcı ve spesifik isimler

```typescript
const CustomerDetailsModal = () => {};
const ServiceHistoryTable = () => {};
```

## 4. TypeScript Kuralları

### Tip Tanımlamaları
```typescript
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

type ServiceStatus = 'pending' | 'in-progress' | 'completed';
```

### Null Kontrolü
```typescript
const getCustomerName = (customer?: Customer): string => {
  return customer?.name ?? 'İsimsiz Müşteri';
};
```

## 5. Bileşen Yönergeleri

### Prop Tanımları
```typescript
interface ServiceCardProps {
  service: Service;
  onStatusChange: (status: ServiceStatus) => void;
  isEditable?: boolean;
}
```

### Hook Kullanımı
```typescript
const useServiceStatus = (serviceId: string) => {
  const [status, setStatus] = useState<ServiceStatus>('pending');
  
  useEffect(() => {
    // Status güncelleme mantığı
  }, [serviceId]);
  
  return { status, setStatus };
};
```

## 6. Dokümantasyon Standartları

### JSDoc Kullanımı
```typescript
/**
 * Müşteri servis geçmişini getirir
 * @param customerId - Müşteri ID
 * @returns Servis geçmişi listesi
 */
const getServiceHistory = async (customerId: string): Promise<Service[]> => {
  // Implementation
};
```

## 7. Test Standartları

### Test Yapısı
```typescript
describe('CustomerService', () => {
  it('should return customer details', async () => {
    // Arrange
    const customerId = '123';
    
    // Act
    const result = await getCustomerDetails(customerId);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

## 8. Performans Yönergeleri

### Code Splitting
```typescript
const CustomerDetails = React.lazy(() => 
  import('./components/CustomerDetails')
);
```

## 9. Güvenlik Yönergeleri

### Veri Doğrulama
```typescript
const validateCustomerData = (data: unknown): data is Customer => {
  // Validation logic
};
```

## 10. Geliştirme İş Akışı

### Git Commit Mesajları
```
feat: Müşteri arama özelliği eklendi
fix: Ödeme hesaplama hatası düzeltildi
docs: API dokümantasyonu güncellendi
```

## Uygulama ve Araçlar

### ESLint Yapılandırması
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

### VS Code Ayarları
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
``` 