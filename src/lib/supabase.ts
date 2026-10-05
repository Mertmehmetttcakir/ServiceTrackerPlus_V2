import { createClient } from '@supabase/supabase-js';

// CRA (process.env.REACT_APP_*) ve Vite (import.meta.env.VITE_*) ortamlarını
// desteklemek için küçük bir helper:
const getEnvVar = (viteKey: string, craKey: string): string | undefined => {
  // Vite env (VITE_*) - tarayıcı tarafında process yok
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as Record<string, string | undefined>;
    if (env[viteKey as keyof typeof env]) {
      return env[viteKey as keyof typeof env] as string | undefined;
    }
  }

  // CRA env (REACT_APP_*) - Node/CRA tarafında process.env
  if (typeof process !== 'undefined' && process.env && process.env[craKey]) {
    return process.env[craKey];
  }

  return undefined;
};

const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL', 'REACT_APP_SUPABASE_URL') || '';
const supabaseAnonKey =
  getEnvVar('VITE_SUPABASE_ANON_KEY', 'REACT_APP_SUPABASE_ANON_KEY') || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key tanımlanmamış!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gelişmiş tip tanımlamaları
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone?: string;
          role: 'customer' | 'technician' | 'admin';
          created_at: string;
          last_login?: string;
          status: 'active' | 'inactive' | 'suspended';
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string;
          role?: 'customer' | 'technician' | 'admin';
          status?: 'active' | 'inactive' | 'suspended';
        };
        Update: {
          full_name?: string;
          phone?: string;
          role?: 'customer' | 'technician' | 'admin';
          last_login?: string;
          status?: 'active' | 'inactive' | 'suspended';
        };
      };
      login_history: {
        Row: {
          id: string;
          user_id: string;
          login_time: string;
          ip_address: string;
          device_info: string;
        };
        Insert: {
          user_id: string;
          login_time?: string;
          ip_address?: string;
          device_info?: string;
        };
      };
    };
  };
};

// Kullanıcı profil yönetimi fonksiyonları
export const createUserProfile = async (user: { 
  id: string, 
  email: string, 
  fullName: string, 
  phone?: string 
}) => {
  const { error } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: 'customer',
      status: 'active'
    });

  if (error) {
    console.error('Kullanıcı profili oluşturma hatası:', error);
    throw error;
  }
};

const fetchClientIp = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { ip?: string };
    return data.ip ?? null;
  } catch (_error) {
    return null;
  }
};

export const updateUserLoginHistory = async (userId: string) => {
  const ipAddress = await fetchClientIp();

  const { error } = await supabase
    .from('login_history')
    .insert({
      user_id: userId,
      login_time: new Date().toISOString(),
      ip_address: ipAddress ?? null,
      device_info: navigator.userAgent
    });

  if (error) {
    console.error('Giriş geçmişi kaydetme hatası:', error);
  }
};