import { HttpError } from '../errors/HttpError';
import { ErrorLogger } from './errorLogger';

export class BaseApiService {
  protected static async handleRequest<T>(
    request: () => Promise<{ data: T | null; error: any }>,
    errorMessage: string
  ): Promise<T> {
    try {
      const { data, error } = await request();

      if (error) {
        await ErrorLogger.logApiError(
          errorMessage,
          error.code || 500,
          error,
          { request: errorMessage }
        );
        throw new HttpError(error.message || errorMessage, error.code || 500);
      }

      if (!data) {
        throw new HttpError('Veri bulunamadı', 404);
      }

      return data;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(errorMessage, 500);
    }
  }

  protected static async handleListRequest<T>(
    request: () => Promise<{ data: T[] | null; error: any }>,
    errorMessage: string
  ): Promise<T[]> {
    try {
      const { data, error } = await request();

      if (error) {
        await ErrorLogger.logApiError(
          errorMessage,
          error.code || 500,
          error,
          { request: errorMessage }
        );
        throw new HttpError(error.message || errorMessage, error.code || 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(errorMessage, 500);
    }
  }

  protected static async handleCreateRequest<T>(
    request: () => Promise<{ data: T | null; error: any }>,
    errorMessage: string
  ): Promise<T> {
    try {
      const { data, error } = await request();

      if (error) {
        await ErrorLogger.logApiError(
          errorMessage,
          error.code || 500,
          error,
          { request: errorMessage }
        );
        throw new HttpError(error.message || errorMessage, error.code || 500);
      }

      if (!data) {
        throw new HttpError('Kayıt oluşturulamadı', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(errorMessage, 500);
    }
  }

  protected static async handleUpdateRequest<T>(
    request: () => Promise<{ data: T | null; error: any }>,
    errorMessage: string
  ): Promise<T> {
    try {
      const { data, error } = await request();

      if (error) {
        await ErrorLogger.logApiError(
          errorMessage,
          error.code || 500,
          error,
          { request: errorMessage }
        );
        throw new HttpError(error.message || errorMessage, error.code || 500);
      }

      if (!data) {
        throw new HttpError('Kayıt güncellenemedi', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(errorMessage, 500);
    }
  }

  protected static async handleDeleteRequest(
    request: () => Promise<{ error: any }>,
    errorMessage: string
  ): Promise<void> {
    try {
      const { error } = await request();

      if (error) {
        await ErrorLogger.logApiError(
          errorMessage,
          error.code || 500,
          error,
          { request: errorMessage }
        );
        throw new HttpError(error.message || errorMessage, error.code || 500);
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(errorMessage, 500);
    }
  }
} 