import { supabase } from '../lib/supabase';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  allowedTypes?: string[];
  maxSize?: number;
}

export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Desteklenmeyen dosya türü',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Dosya boyutu çok büyük',
    };
  }

  return { isValid: true };
};

export const uploadFile = async ({
  bucket,
  path,
  file,
  allowedTypes = ALLOWED_IMAGE_TYPES,
  maxSize = MAX_FILE_SIZE,
}: UploadOptions): Promise<{ url: string; error?: string }> => {
  try {
    // Dosya doğrulama
    const validation = validateFile(file, allowedTypes, maxSize);
    if (!validation.isValid) {
      return { url: '', error: validation.error };
    }

    // Dosya yükleme
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Public URL alma
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { url: publicUrl };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return {
      url: '',
      error: 'Dosya yüklenirken bir hata oluştu',
    };
  }
};

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return {
      success: false,
      error: 'Dosya silinirken bir hata oluştu',
    };
  }
};

// Profil fotoğrafı yükleme yardımcı fonksiyonu
export const uploadProfilePhoto = async (
  userId: string,
  file: File
): Promise<{ url: string; error?: string }> => {
  const fileExt = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${fileExt}`;

  return uploadFile({
    bucket: 'avatars',
    path,
    file,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: 2 * 1024 * 1024, // 2MB
  });
};

// Servis raporu yükleme yardımcı fonksiyonu
export const uploadServiceReport = async (
  serviceId: string,
  file: File
): Promise<{ url: string; error?: string }> => {
  const fileExt = file.name.split('.').pop();
  const path = `${serviceId}/${Date.now()}.${fileExt}`;

  return uploadFile({
    bucket: 'service-reports',
    path,
    file,
    allowedTypes: ALLOWED_DOCUMENT_TYPES,
    maxSize: MAX_FILE_SIZE,
  });
}; 