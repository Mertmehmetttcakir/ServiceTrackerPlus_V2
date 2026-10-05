import { supabase } from '../lib/supabase';

const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'application/pdf': true,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface StorageInfo {
  used: number; // MB cinsinden
  limit: number; // MB cinsinden
  breakdown: {
    companyLogos: number;
    profilePhotos: number;
    documents: number;
    database: number;
  };
}

export class StorageService {
  private static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
      return {
        isValid: false,
        error: 'Desteklenmeyen dosya türü',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'Dosya boyutu çok büyük (max: 5MB)',
      };
    }

    return { isValid: true };
  }

  static async uploadFile(
    file: File,
    bucket: string,
    path: string
  ): Promise<{ url: string; error?: string }> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { url: '', error: validation.error };
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Dosya yükleme hatası:', error);
        return { url: '', error: 'Dosya yüklenemedi' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      return { url: '', error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * JSON formatındaki yedek dosyasını Supabase Storage "backups" bucket'ına yükler.
   * Not: Bucket RLS ayarlarının istemci (anon/auth) rolüne yazma izni veriyor olması gerekir;
   * aksi halde sadece console'a hata loglanır.
   */
  static async uploadBackupJson(
    userId: string,
    payload: unknown
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = `${userId}/backup-${timestamp}.json`;

      const { data, error } = await supabase.storage
        .from('backups')
        .upload(filePath, blob, {
          cacheControl: '0',
          upsert: false,
        });

      if (error || !data) {
        console.error('Yedekleme dosyası yükleme hatası:', error);
        return {
          success: false,
          error: 'Yedekleme Supabase Storage\'a kaydedilemedi',
        };
      }

      return {
        success: true,
        path: data.path,
      };
    } catch (error) {
      console.error('Yedekleme dosyası oluşturma/yükleme hatası:', error);
      return {
        success: false,
        error: 'Yedekleme Supabase Storage\'a kaydedilemedi',
      };
    }
  }

  static async deleteFile(
    bucket: string,
    path: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Dosya silme hatası:', error);
        return { success: false, error: 'Dosya silinemedi' };
      }

      return { success: true };
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  static async getFileUrl(
    bucket: string,
    path: string
  ): Promise<{ url: string; error?: string }> {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { url: publicUrl };
    } catch (error) {
      console.error('Dosya URL hatası:', error);
      return { url: '', error: 'Dosya URL\'i alınamadı' };
    }
  }

  /**
   * Kullanıcının toplam storage kullanımını hesaplar
   */
  static async calculateUserStorageUsage(userId: string): Promise<StorageInfo> {
    try {
      const breakdown = {
        companyLogos: 0,
        profilePhotos: 0,
        documents: 0,
        database: 0,
      };

      // 1. Company Logos Storage
      breakdown.companyLogos = await this.calculateBucketUsage('company-logos', userId);
      
      // 2. Profile Photos Storage (eğer varsa)
      breakdown.profilePhotos = await this.calculateBucketUsage('profile-photos', userId);
      
      // 3. Documents Storage (eğer varsa)
      breakdown.documents = await this.calculateBucketUsage('documents', userId);
      
      // 4. Database boyutunu tahmin et
      breakdown.database = await this.estimateDatabaseSize(userId);

      const totalUsed = Object.values(breakdown).reduce((acc, val) => acc + val, 0);
      
      return {
        used: Math.round(totalUsed * 100) / 100, // 2 ondalık basamak
        limit: 1000, // 1GB default limit
        breakdown,
      };
    } catch (error) {
      console.error('Storage hesaplama hatası:', error);
      return {
        used: 0,
        limit: 1000,
        breakdown: {
          companyLogos: 0,
          profilePhotos: 0,
          documents: 0,
          database: 0,
        },
      };
    }
  }

  /**
   * Belirli bir bucket'taki kullanıcı dosyalarının boyutunu hesaplar
   */
  private static async calculateBucketUsage(bucketName: string, userId: string): Promise<number> {
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list(userId, {
          limit: 1000,
          offset: 0,
        });

      if (error || !files) {
        if (
          (typeof process !== 'undefined' &&
            process.env &&
            process.env.NODE_ENV === 'development') ||
          (typeof import.meta !== 'undefined' &&
            (import.meta as any).env &&
            (import.meta as any).env.DEV)
        ) {
          console.log(`${bucketName} bucket bulunamadı veya boş`);
        }
        return 0;
      }

      // Dosya boyutlarını topla (metadata.size byte cinsinden)
      const totalBytes = files.reduce((acc, file) => {
        const fileSize = file.metadata?.size || 0;
        return acc + fileSize;
      }, 0);

      // Byte'ları MB'ye çevir
      return this.bytesToMB(totalBytes);
    } catch (error) {
      console.error(`${bucketName} bucket hesaplama hatası:`, error);
      return 0;
    }
  }

  /**
   * Kullanıcının veritabanı boyutunu tahmin eder
   */
  private static async estimateDatabaseSize(userId: string): Promise<number> {
    try {
      // Önce kullanıcının müşterilerini al
      const { data: userCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId);

      const customerIds = userCustomers?.map(c => c.id) || [];

      // Kullanıcının kayıt sayılarını al
      const [
        { count: customerCount },
        { count: vehicleCount },
        { count: appointmentCount },
        { count: jobCount },
        { count: transactionCount }
      ] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        customerIds.length > 0 
          ? supabase.from('vehicles').select('id', { count: 'exact', head: true }).in('customer_id', customerIds)
          : Promise.resolve({ count: 0 }),
        customerIds.length > 0 
          ? supabase.from('appointments').select('id', { count: 'exact', head: true }).in('customer_id', customerIds)
          : Promise.resolve({ count: 0 }),
        customerIds.length > 0 
          ? supabase.from('jobs').select('id', { count: 'exact', head: true }).in('customer_id', customerIds)
          : Promise.resolve({ count: 0 }),
        customerIds.length > 0 
          ? supabase.from('financial_transactions').select('id', { count: 'exact', head: true }).in('customer_id', customerIds)
          : Promise.resolve({ count: 0 })
      ]);

      // Tahmini boyutlar (KB cinsinden) - ortalama kayıt boyutları
      const estimatedKB = 
        (customerCount || 0) * 2 +      // Her müşteri ~2KB
        (vehicleCount || 0) * 1 +       // Her araç ~1KB
        (appointmentCount || 0) * 3 +   // Her randevu ~3KB
        (jobCount || 0) * 5 +           // Her iş ~5KB
        (transactionCount || 0) * 1;    // Her işlem ~1KB

      // KB'yi MB'ye çevir
      return Math.max(0.1, estimatedKB / 1024); // Minimum 0.1MB
    } catch (error) {
      console.error('Veritabanı boyutu tahmini hatası:', error);
      return 0.1; // Minimum 0.1MB
    }
  }

  /**
   * Byte'ları MB'ye çevirir
   */
  private static bytesToMB(bytes: number): number {
    return bytes / (1024 * 1024);
  }

  /**
   * MB'yi okunabilir format'a çevirir
   */
  static formatStorageSize(mb: number): string {
    if (mb < 1) {
      return `${(mb * 1024).toFixed(1)} KB`;
    } else if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    } else {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
  }

  /**
   * Storage kullanım yüzdesini hesaplar
   */
  static calculateUsagePercentage(used: number, limit: number): number {
    return Math.round((used / limit) * 100);
  }

  /**
   * Kullanıcının storage planını belirler
   */
  static getUserStoragePlan(totalCustomers: number): { name: string; limit: number } {
    if (totalCustomers <= 50) {
      return { name: 'Free', limit: 500 }; // 500MB
    } else if (totalCustomers <= 200) {
      return { name: 'Pro', limit: 8 * 1024 }; // 8GB
    } else {
      return { name: 'Team', limit: 100 * 1024 }; // 100GB
    }
  }
} 