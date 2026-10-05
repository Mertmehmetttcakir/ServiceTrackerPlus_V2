import { supabase } from '../lib/supabase';
import { Company, CompanyCreate, CompanyUpdate } from '../types/company';
import { BaseApiService } from './baseApiService';

export class CompanyService extends BaseApiService {
  /**
   * Kullanıcının şirket bilgilerini getirir
   */
  static async getCompanyProfile(): Promise<Company | null> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Kayıt bulunamadı, null döndür
        return null;
      }
      console.error('Şirket profili getirme hatası:', error);
      throw new Error('Şirket bilgileri getirilemedi');
    }

    return data;
  }

  /**
   * Şirket profili oluşturur
   */
  static async createCompanyProfile(data: CompanyCreate): Promise<Company> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const companyData = {
      ...data,
      user_id: user.id,
    };

    return this.handleCreateRequest<Company>(
      async () => supabase
        .from('company_profiles')
        .insert([companyData])
        .select('*')
        .single(),
      'Şirket profili oluşturulamadı'
    );
  }

  /**
   * Şirket profili günceller
   */
  static async updateCompanyProfile(data: CompanyUpdate): Promise<Company> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleUpdateRequest<Company>(
      async () => supabase
        .from('company_profiles')
        .update(data)
        .eq('user_id', user.id)
        .select('*')
        .single(),
      'Şirket profili güncellenemedi'
    );
  }

  /**
   * Logo yükler
   */
  static async uploadLogo(file: File): Promise<string> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    // Dosya adını oluştur
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    try {
      // Eski logoyu sil (varsa)
      await supabase.storage
        .from('company-logos')
        .remove([fileName]);

      // Yeni logoyu yükle
      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Logo yükleme hatası:', error);
        throw new Error('Logo yüklenemedi');
      }

      // Public URL'i al
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Logo yükleme hatası:', error);
      throw new Error('Logo yüklenemedi');
    }
  }

  /**
   * Logo siler
   */
  static async deleteLogo(): Promise<void> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    try {
      // Şirket profilindeki logo URL'ini temizle
      await this.updateCompanyProfile({ logo_url: null });

      // Storage'dan logoyu sil
      const { error } = await supabase.storage
        .from('company-logos')
        .remove([`${user.id}/logo.jpg`, `${user.id}/logo.png`, `${user.id}/logo.jpeg`]);

      if (error) {
        console.error('Logo silme hatası:', error);
        // Hata olsa bile devam et, çünkü profil güncellendi
      }
    } catch (error) {
      console.error('Logo silme hatası:', error);
      throw new Error('Logo silinemedi');
    }
  }
} 