import { supabase } from '../lib/supabase';

export interface ErrorLog {
  id?: string;
  user_id?: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export const logError = async (error: Error, metadata?: Record<string, any>): Promise<void> => {
  try {
    const errorLog: ErrorLog = {
      error_type: error.name,
      message: error.message,
      stack_trace: error.stack,
      metadata,
    };

    const { error: insertError } = await supabase
      .from('error_logs')
      .insert([errorLog]);

    if (insertError) {
      console.error('Hata loglanamadı:', insertError);
    }
  } catch (logError) {
    console.error('Hata loglama işlemi başarısız:', logError);
  }
};

export const handleApiError = (error: unknown): { message: string; status: number } => {
  if (error instanceof Error) {
    // Bilinen hata türleri
    switch (error.name) {
      case 'ValidationError':
        return { message: error.message, status: 400 };
      case 'AuthenticationError':
        return { message: 'Yetkilendirme hatası', status: 401 };
      case 'AuthorizationError':
        return { message: 'Yetki hatası', status: 403 };
      case 'NotFoundError':
        return { message: 'Kayıt bulunamadı', status: 404 };
      case 'DatabaseError':
        return { message: 'Veritabanı hatası', status: 500 };
      default:
        return { message: 'Beklenmeyen bir hata oluştu', status: 500 };
    }
  }

  // Bilinmeyen hata türleri
  return { message: 'Beklenmeyen bir hata oluştu', status: 500 };
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    await logError(error instanceof Error ? error : new Error(String(error)), context);
    throw error;
  }
};

// Özel hata sınıfları
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}; 