import { supabase } from '../lib/supabase';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 dakika

export class SessionService {
  private static lastActivity: number = Date.now();
  private static sessionTimeoutId: NodeJS.Timeout | null = null;

  static initialize() {
    this.resetSessionTimeout();
    this.setupActivityListeners();
  }

  private static setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, () => {
        this.updateLastActivity();
      });
    });
  }

  private static updateLastActivity() {
    this.lastActivity = Date.now();
    this.resetSessionTimeout();
  }

  private static resetSessionTimeout() {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    this.sessionTimeoutId = setTimeout(async () => {
      const inactiveTime = Date.now() - this.lastActivity;
      
      if (inactiveTime >= SESSION_TIMEOUT) {
        await this.handleSessionTimeout();
      }
    }, SESSION_TIMEOUT);
  }

  private static async handleSessionTimeout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      window.location.href = '/auth/login?session=expired';
    } catch (error) {
      console.error('Oturum sonlandırma hatası:', error);
    }
  }

  static async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!session) throw new Error('Oturum bulunamadı');

      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      this.updateLastActivity();
      return { success: true };
    } catch (error) {
      console.error('Oturum yenileme hatası:', error);
      return { success: false, error: 'Oturum yenilenemedi' };
    }
  }

  static async checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!session) return { isValid: false };

      const inactiveTime = Date.now() - this.lastActivity;
      const isValid = inactiveTime < SESSION_TIMEOUT;

      if (!isValid) {
        await this.handleSessionTimeout();
      }

      return { isValid };
    } catch (error) {
      console.error('Oturum kontrolü hatası:', error);
      return { isValid: false, error: 'Oturum kontrolü yapılamadı' };
    }
  }

  static cleanup() {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.removeEventListener(event, () => {
        this.updateLastActivity();
      });
    });
  }
} 