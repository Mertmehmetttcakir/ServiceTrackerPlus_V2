import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sentry } from '../lib/sentry';
import { supabase } from '../lib/supabase';
import { User as AppUser, LoginRequest } from '../types/auth';
import { clearCacheOnUserChange } from '../utils/cacheUtils';
import { logger } from '../utils/logger';
import { RATE_LIMITS, rateLimiter } from '../utils/rateLimiter';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null; // Session state'i eklendi
  isAuthenticated: boolean;
  isLoading: boolean; // İlk oturum yüklemesi için
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Başlangıçta true
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ? (currentSession.user as unknown as AppUser) : null;
      setUser(currentUser);
      
      // Sentry'ye kullanıcı bilgisini set et
      if (currentUser) {
        Sentry.setUser({ id: currentUser.id, email: currentUser.email });
      } else {
        Sentry.setUser(null);
      }

      setIsLoading(false);
    }).catch((_err) => {
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        const previousUserId = user?.id;
        const newUserId = newSession?.user?.id;
        
        setSession(newSession);
        const newUser = newSession?.user ? (newSession.user as unknown as AppUser) : null;
        setUser(newUser);
        
        // Kullanıcı değiştiğinde Sentry context'ini güncelle
        if (newUser) {
           Sentry.setUser({ id: newUser.id, email: newUser.email });
        } else {
           Sentry.setUser(null);
        }
        
        // Kullanıcı değiştiğinde cache'i temizle
        if (previousUserId !== newUserId) {
          clearCacheOnUserChange(queryClient);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    // Rate limit kontrolü
    if (!rateLimiter.check(credentials.email, RATE_LIMITS.login)) {
      logger.warn('Giriş denemesi rate limit tarafından engellendi', {
        email: credentials.email,
      });
      throw new Error('Çok fazla giriş denemesi. Lütfen 15 dakika bekleyip tekrar deneyin.');
    }

    setIsLoading(true); 
    setError(null);
    logger.info('Kullanıcı girişi denemesi başlatıldı', { email: credentials.email });
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) {
        throw signInError;
      }
      
      // E-posta onayı kontrolü
      if (data.user && !data.user.email_confirmed_at) {
        // Kullanıcı giriş yapmış olabilir ama e-posta onayı yoksa
        // oturumu hemen kapatıp hata fırlat.
        await supabase.auth.signOut();
        logger.warn('E-posta onayı olmayan kullanıcı giriş denemesi', {
          email: credentials.email,
          userId: data.user.id,
        });
        throw new Error('Giriş yapmadan önce e-postanızı onaylamanız gerekmektedir. Lütfen gelen kutunuzu kontrol edin.');
      }

      if (data.user) {
        logger.info('Kullanıcı girişi başarılı', {
          email: data.user.email,
          userId: data.user.id,
        });
      }
    } catch (error: any) {
      setError(error.message || 'Giriş başarısız');
      logger.error('Kullanıcı girişi başarısız', error, { email: credentials.email });
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      // Çıkış yapmadan önce cache'i temizle
      clearCacheOnUserChange(queryClient);
      if (user?.id) {
        logger.info('Kullanıcı çıkış yapıyor', { userId: user.id, email: user.email });
      }
      
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      logger.info('Kullanıcı çıkış işlemi tamamlandı');
    } catch (error: any) {
      setError(error.message || 'Çıkış yapılırken hata oluştu');
      logger.error('Kullanıcı çıkışı sırasında hata oluştu', error, {
        userId: user?.id,
        email: user?.email,
      });
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session, 
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 