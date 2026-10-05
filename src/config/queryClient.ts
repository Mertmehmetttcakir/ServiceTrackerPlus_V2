import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Varsayılan önbellekleme süresi: 5 dakika
      staleTime: 5 * 60 * 1000,
      // Garbage collection süresi: 30 dakika
      gcTime: 30 * 60 * 1000,
      // Hata durumunda 2 kez tekrar dene
      retry: 2,
      // Ağ bağlantısı geri geldiğinde veriyi yenile
      refetchOnReconnect: true,
      // Pencere odağında otomatik yenileme (opsiyonel, performansa göre açılabilir)
      refetchOnWindowFocus: false,
      // Component mount olduğunda stale ise yenile
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Merkezi Query Key Yönetimi
export const QUERY_KEYS = {
  // Müşteriler - Orta sıklıkta değişir
  customers: {
    all: ['customers'] as const,
    list: (filters: Record<string, any>) => ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    staleTime: 1000 * 60 * 5, // 5 dakika
  },

  // Araçlar - Az değişir
  vehicles: {
    all: ['vehicles'] as const,
    byCustomer: (customerId: string) => ['vehicles', 'customer', customerId] as const,
    detail: (id: string) => ['vehicles', 'detail', id] as const,
    staleTime: 1000 * 60 * 10, // 10 dakika
  },

  // Randevular - Sık değişir
  appointments: {
    all: ['appointments'] as const,
    list: (filters: Record<string, any>) => ['appointments', 'list', filters] as const,
    detail: (id: string) => ['appointments', 'detail', id] as const,
    calendar: (month: string, year: string) => ['appointments', 'calendar', month, year] as const,
    staleTime: 1000 * 60 * 2, // 2 dakika
  },

  // İşler ve Finans - Çok sık değişir (Dashboard için)
  jobs: {
    all: ['jobs'] as const,
    byCustomer: (customerId: string) => ['jobs', 'customer', customerId] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    staleTime: 0, // Anlık veri önemli
  },

  financial: {
    all: ['financial'] as const,
    byCustomer: (customerId: string) => ['financial', 'customer', customerId] as const,
    stats: ['financial', 'stats'] as const,
    staleTime: 0, // Anlık ciro takibi için
  },
  
  // Dashboard - Anlık
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    staleTime: 0,
  }
};
