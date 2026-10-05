import { Sentry } from '../lib/sentry';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  message: string;
  level: LogLevel;
  context?: Record<string, unknown>;
  error?: Error;
}

// Ortam değişkenlerini CRA (process.env) + Vite (import.meta.env) ile uyumlu okuyacak helper'lar
const getNodeEnv = (): string => {
  const fromProcess =
    typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : undefined;
  if (fromProcess) return fromProcess;

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as Record<string, string | boolean | undefined>;
    if (env.MODE && typeof env.MODE === 'string') return env.MODE;
    if (env.DEV) return 'development';
  }

  return 'production';
};

const getSentryTestFlag = (): boolean => {
  const fromProcess =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_ENABLE_SENTRY_TEST === 'true';
  if (fromProcess) return true;

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as Record<string, string | boolean | undefined>;
    return env.VITE_ENABLE_SENTRY_TEST === 'true';
  }

  return false;
};

class Logger {
  private isDevelopment = getNodeEnv() === 'development';
  private isSentryTestMode = getSentryTestFlag();

  log(data: LogData): void {
    const { message, level, context, error } = data;

    // Development ortamında detaylı console log
    if (this.isDevelopment) {
      // context ve error birlikte gösterilsin
      const extra = context || error ? { context, error } : undefined;

      switch (level) {
        case 'info':
          console.info(message, extra);
          break;
        case 'warn':
          console.warn(message, extra);
          break;
        case 'error':
          console.error(message, extra);
          break;
        case 'debug':
          console.debug(message, extra);
          break;
        default:
          console.log(message, extra);
      }
      
      // Development modunda ama Sentry testi açıksa Sentry'ye de gönder
      if (this.isSentryTestMode && (level === 'error' || level === 'warn')) {
        this.sendToSentry(message, level, context, error);
      }
      return;
    }

    // Production ortamında
    if (level === 'error') {
      console.error(message);
      this.sendToSentry(message, level, context, error);
    } else if (level === 'warn') {
      console.warn(message);
      this.sendToSentry(message, level, context, error);
    }
  }

  private sendToSentry(message: string, level: LogLevel, context?: Record<string, unknown>, error?: Error) {
    try {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setExtras(context);
        }
        if (level === 'error') {
          scope.setLevel('error');
          if (error) {
             // Hata nesnesi varsa onu gönder, mesajı tag veya extra olarak ekle
             scope.setExtra('custom_message', message);
             Sentry.captureException(error);
          } else {
            // Sadece mesaj varsa
            Sentry.captureMessage(message);
          }
        } else if (level === 'warn') {
          scope.setLevel('warning');
          Sentry.captureMessage(message);
        }
      });
    } catch (e) {
      console.error('Sentry log hatası:', e);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log({ message, level: 'info', context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log({ message, level: 'warn', context });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log({ message, level: 'error', error, context });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log({ message, level: 'debug', context });
  }
}

export const logger = new Logger();


