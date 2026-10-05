export interface SystemSettings {
  id: string;
  user_id: string;
  
  // Uygulama Ayarları
  language: 'tr' | 'en';
  timezone: string;
  currency: 'TRY' | 'USD' | 'EUR';
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  records_per_page: number;
  monthly_appointment_target: number;
  monthly_revenue_target: number;
  
  // Bildirim Ayarları
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  payment_reminders: boolean;
  
  // Güvenlik Ayarları
  session_timeout: number; // dakika cinsinden
  auto_logout: boolean;
  
  // Yedekleme Ayarları
  auto_backup: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  
  created_at: string;
  updated_at: string;
}

export interface SystemSettingsUpdate {
  language?: 'tr' | 'en';
  timezone?: string;
  currency?: 'TRY' | 'USD' | 'EUR';
  date_format?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  records_per_page?: number;
  monthly_appointment_target?: number;
  monthly_revenue_target?: number;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  appointment_reminders?: boolean;
  payment_reminders?: boolean;
  session_timeout?: number;
  auto_logout?: boolean;
  auto_backup?: boolean;
  backup_frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface StorageBreakdown {
  companyLogos: number;
  profilePhotos: number;
  documents: number;
  database: number;
}

export interface SystemInfo {
  app_version: string;
  last_updated: string;
  total_users: number;
  total_customers: number;
  total_jobs: number;
  storage_used: number; // MB cinsinden
  storage_limit: number; // MB cinsinden
  storage_breakdown: StorageBreakdown;
  storage_plan: string; // 'Free', 'Pro', 'Team'
} 