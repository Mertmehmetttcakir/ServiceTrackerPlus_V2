import * as Sentry from '@sentry/react';

// CRA ve Vite ortamlarında güvenli şekilde env okumak için helper'lar
const getEnvVar = (name: string): string | undefined => {
  // Node/CRA tarzı ortam
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  // Vite tarzı ortam (import.meta.env)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as Record<string, string | undefined>;
    return env[name as keyof typeof env] as string | undefined;
  }
  return undefined;
};

const getNodeEnv = (): string => {
  const fromProcess =
    typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : undefined;
  if (fromProcess) return fromProcess;

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as Record<string, string | undefined>;
    return env.MODE || (env.DEV ? 'development' : 'production') || 'production';
  }

  return 'production';
};

const SENTRY_DSN = getEnvVar('REACT_APP_SENTRY_DSN') || getEnvVar('VITE_SENTRY_DSN');
const ENABLE_SENTRY_TEST =
  getEnvVar('REACT_APP_ENABLE_SENTRY_TEST') === 'true' ||
  getEnvVar('VITE_ENABLE_SENTRY_TEST') === 'true';

export const initSentry = () => {
  const nodeEnv = getNodeEnv();
  const isDevelopment = nodeEnv === 'development';

  console.log('[Sentry] Init çağrıldı', {
    dsn: SENTRY_DSN ? 'Var' : 'Yok',
    isDev: isDevelopment,
    enableTest: ENABLE_SENTRY_TEST
  });

  // DSN yoksa veya development ortamındayız ve test modu açık değilse initialize etme
  if (!SENTRY_DSN || (isDevelopment && !ENABLE_SENTRY_TEST)) {
    console.warn('[Sentry] Başlatılmadı: DSN eksik veya Test modu kapalı.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: nodeEnv,
    integrations: [Sentry.browserTracingIntegration()], // v7 yeni syntax
    tracesSampleRate: isDevelopment ? 1.0 : 0.2,
    debug: true, // Konsola debug logları basar
    // Transport hatası ayıklama
    beforeSend(event, hint) {
      console.log('[Sentry] beforeSend tetiklendi', event);
      return event;
    },
  });
  
  console.log('[Sentry] Başarıyla başlatıldı');
};

export { Sentry };
