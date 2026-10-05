import { supabase } from '../lib/supabase';
import { ServiceHistory, ServiceHistoryCreate, ServiceHistoryUpdate } from '../types/serviceHistory';
import { BaseApiService } from './baseApiService';

export class ServiceHistoryService extends BaseApiService {
  static async getServiceHistories(): Promise<ServiceHistory[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<ServiceHistory>(
      async () => supabase
        .from('service_history')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin servis geçmişi
        .order('service_date', { ascending: false }),
      'Servis geçmişi getirilemedi'
    );
  }

  static async getServiceHistoryById(id: string): Promise<ServiceHistory> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleRequest<ServiceHistory>(
      async () => supabase
        .from('service_history')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('id', id)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin servis kaydı
        .single(),
      'Servis detayları getirilemedi'
    );
  }

  static async createServiceHistory(data: ServiceHistoryCreate): Promise<ServiceHistory> {
    return this.handleCreateRequest<ServiceHistory>(
      async () => supabase
        .from('service_history')
        .insert([data])
        .select(`
          *,
          customer:customers (id, full_name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .single(),
      'Servis kaydı oluşturulamadı'
    );
  }

  static async updateServiceHistory(
    id: string,
    data: ServiceHistoryUpdate
  ): Promise<ServiceHistory> {
    return this.handleUpdateRequest<ServiceHistory>(
      async () => supabase
        .from('service_history')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          customer:customers (id, full_name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .single(),
      'Servis kaydı güncellenemedi'
    );
  }

  static async deleteServiceHistory(id: string): Promise<void> {
    return this.handleDeleteRequest(
      async () => supabase
        .from('service_history')
        .delete()
        .eq('id', id),
      'Servis kaydı silinemedi'
    );
  }

  static async getCustomerServiceHistory(customerId: string): Promise<ServiceHistory[]> {
    return this.handleListRequest<ServiceHistory>(
      async () => supabase
        .from('service_history')
        .select(`
          *,
          customer:customers (id, full_name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer_id', customerId)
        .order('service_date', { ascending: false }),
      'Müşteri servis geçmişi getirilemedi'
    );
  }

  static async getVehicleServiceHistory(vehicleId: string): Promise<ServiceHistory[]> {
    return this.handleListRequest<ServiceHistory>(
      async () => supabase
        .from('service_history')
        .select(`
          *,
          customer:customers (id, full_name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false }),
      'Araç servis geçmişi getirilemedi'
    );
  }

  static async getRecentServiceHistory(limit: number = 10): Promise<ServiceHistory[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<ServiceHistory>(
      async () => supabase
        .from('service_history')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin servis geçmişi
        .order('service_date', { ascending: false })
        .limit(limit),
      'Son servis kayıtları getirilemedi'
    );
  }

  static async generateServiceReportPdf(serviceId: string): Promise<Blob> {
    const { data, error } = await supabase
      .from('service_history')
      .select(`
        *,
        customer:customers (id, full_name, phone),
        vehicle:vehicles (id, plate, brand, model)
      `)
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Servis kaydı bulunamadı');

    // PDF oluşturma işlemi burada yapılacak
    // Şimdilik boş bir Blob döndürüyoruz
    return new Blob(['PDF içeriği'], { type: 'application/pdf' });
  }

  static async getServiceRecordPdf(serviceId: string): Promise<Blob> {
    const { data, error } = await supabase
      .from('service_history')
      .select(`
        *,
        customer:customers (id, full_name, phone),
        vehicle:vehicles (id, plate, brand, model)
      `)
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Servis kaydı bulunamadı');

    // PDF oluşturma işlemi burada yapılacak
    // Şimdilik boş bir Blob döndürüyoruz
    return new Blob(['PDF içeriği'], { type: 'application/pdf' });
  }
} 