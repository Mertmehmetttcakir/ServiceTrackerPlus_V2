import { supabase } from '../lib/supabase';

interface ErrorLog {
  error_type: string;
  message: string;
  stack_trace?: string;
  metadata?: Record<string, unknown>;
}

export class ErrorLogger {
  private static async logToSupabase(errorLog: ErrorLog) {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert([errorLog]);

      if (error) {
        console.error('Hata log kaydı başarısız:', error);
      }
    } catch (error) {
      console.error('Hata log servisi hatası:', error);
    }
  }

  static async logError(
    error: Error | unknown,
    metadata?: Record<string, unknown>
  ) {
    try {
      const errorLog: ErrorLog = {
        error_type: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : String(error),
        stack_trace: error instanceof Error ? error.stack : undefined,
        metadata,
      };

      await this.logToSupabase(errorLog);
    } catch (error) {
      console.error('Hata loglama hatası:', error);
    }
  }

  static async logApiError(
    endpoint: string,
    status: number,
    response: unknown,
    metadata?: Record<string, unknown>
  ) {
    try {
      const errorLog: ErrorLog = {
        error_type: 'ApiError',
        message: `API Hatası: ${endpoint} (${status})`,
        metadata: {
          endpoint,
          status,
          response,
          ...metadata,
        },
      };

      await this.logToSupabase(errorLog);
    } catch (error) {
      console.error('API hata loglama hatası:', error);
    }
  }

  static async logValidationError(
    field: string,
    message: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      const errorLog: ErrorLog = {
        error_type: 'ValidationError',
        message: `Doğrulama Hatası: ${field} - ${message}`,
        metadata: {
          field,
          ...metadata,
        },
      };

      await this.logToSupabase(errorLog);
    } catch (error) {
      console.error('Doğrulama hata loglama hatası:', error);
    }
  }

  static async logAuthError(
    action: string,
    error: Error | unknown,
    metadata?: Record<string, unknown>
  ) {
    try {
      const errorLog: ErrorLog = {
        error_type: 'AuthError',
        message: `Kimlik Doğrulama Hatası: ${action}`,
        stack_trace: error instanceof Error ? error.stack : undefined,
        metadata: {
          action,
          ...metadata,
        },
      };

      await this.logToSupabase(errorLog);
    } catch (error) {
      console.error('Kimlik doğrulama hata loglama hatası:', error);
    }
  }
} 