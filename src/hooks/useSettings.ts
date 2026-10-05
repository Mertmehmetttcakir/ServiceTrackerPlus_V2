import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../services/settingsService';
import { SystemSettingsUpdate } from '../types/settings';

const SETTINGS_QUERY_KEY = 'settings';

/**
 * Sistem ayarlarını getirir
 */
export const useSystemSettings = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'system'],
    queryFn: SettingsService.getSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
  });
};

/**
 * Sistem ayarlarını günceller
 */
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: SystemSettingsUpdate) => SettingsService.updateSystemSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData([SETTINGS_QUERY_KEY, 'system'], data);
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast({
        title: 'Başarılı',
        description: 'Sistem ayarları güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Sistem ayarları güncellenemedi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Sistem bilgilerini getirir
 */
export const useSystemInfo = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'info'],
    queryFn: SettingsService.getSystemInfo,
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * Ayarları varsayılan değerlere sıfırlar
 */
export const useResetSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => SettingsService.resetToDefaults(),
    onSuccess: (data) => {
      queryClient.setQueryData([SETTINGS_QUERY_KEY, 'system'], data);
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast({
        title: 'Başarılı',
        description: 'Ayarlar varsayılan değerlere sıfırlandı',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Ayarlar sıfırlanamadı',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Manuel yedekleme oluşturur (kullanıcı tıkladığında)
 * - JSON dosyasını indirir
 * - Supabase Storage'a yüklemeyi SettingsService içinde dener
 * - Son başarılı zamanı localStorage'a yazar
 */
export const useCreateBackup = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: () => SettingsService.createBackup(),
    onSuccess: (result) => {
      if (result.success && result.data) {
        try {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const date = new Date().toISOString().split('T')[0];
          link.download = `servicetracker-backup-${date}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          try {
            // Son başarılı yedekleme zamanını localStorage'a yaz
            localStorage.setItem('servicetracker:lastBackupAt', Date.now().toString());
          } catch (e) {
            console.error('Yedekleme zamanını kaydederken hata:', e);
          }
        } catch (e) {
          console.error('Yedek dosyası indirilirken hata:', e);
        }
      }

      toast({
        title: result.success ? 'Başarılı' : 'Hata',
        description: result.message,
        status: result.success ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Yedekleme oluşturulamadı',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Otomatik (arka planda) yedekleme oluşturur
 * - Kullanıcıya JSON indirtmez
 * - Sadece Storage yedeğini ve localStorage zaman damgasını günceller
 * Otomatik periyodik yedeklemeler için AutoBackupManager tarafından kullanılır.
 */
export const useCreateBackupSilent = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: () => SettingsService.createBackup(),
    onSuccess: (result) => {
      if (result.success) {
        try {
          localStorage.setItem('servicetracker:lastBackupAt', Date.now().toString());
        } catch (e) {
          console.error('Otomatik yedekleme zamanını kaydederken hata:', e);
        }
      }

      // Otomatik yedekleme için daha sade bir bilgi mesajı
      toast({
        title: result.success ? 'Otomatik yedekleme tamamlandı' : 'Otomatik yedekleme hatası',
        description: result.message,
        status: result.success ? 'success' : 'error',
        duration: 4000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Otomatik yedekleme hatası',
        description: error.message || 'Yedekleme oluşturulamadı',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};