import { supabase } from '../lib/supabase';
import { Customer, CustomerCreate, CustomerUpdate } from '../types/customer';
import { BaseApiService } from './baseApiService';

// Helper function to map view data to Customer type
const mapCustomerFromView = (customerData: any): Customer => {
  return {
    id: customerData.id,
    user_id: customerData.user_id,
    full_name: customerData.full_name,
    email: customerData.email,
    phone: customerData.phone,
    address: customerData.address,
    created_at: customerData.customer_created_at, // Mapping from alias
    updated_at: customerData.customer_updated_at, // Mapping from alias
    last_appointment_date: customerData.last_appointment_date,
    total_outstanding_balance_from_jobs: customerData.total_outstanding_balance_from_jobs,
    // vehicles, appointments ve jobs burada doldurulmaz, ayrı sorgu gerektirirler
  };
};

export class CustomerService extends BaseApiService {
  static async getCustomers(): Promise<Customer[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const { data, error } = await supabase
      .from('customers_extended_details') // Use the new view
        .select('*')
        .eq('user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerini getir
      .order('customer_created_at', { ascending: false }); // Order by aliased column

    if (error) {
      console.error('Error fetching customers from view:', error);
      throw new Error('Müşteriler getirilemedi');
    }
    return (data || []).map(mapCustomerFromView);
  }

  static async getCustomerById(id: string): Promise<Customer> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const { data, error } = await supabase
      .from('customers_extended_details') // Use the new view
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Sadece giriş yapan kullanıcının müşterisini getir
      .single();

    if (error) {
      console.error(`Error fetching customer by ID ${id} from view:`, error);
      throw new Error('Müşteri detayları getirilemedi');
    }
    if (!data) {
        throw new Error('Müşteri bulunamadı veya erişim yetkiniz yok');
    }
    return mapCustomerFromView(data);
  }

  static async createCustomer(customerData: CustomerCreate): Promise<Customer> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    // Müşteri verisine user_id'yi ekle
    const customerWithUserId = {
      ...customerData,
      user_id: user.id
    };

    return this.handleCreateRequest<Customer>(
      async () => supabase
        .from('customers')
        .insert([customerWithUserId])
        .select() // Temel customer verisini seçer
        .single(),
      'Müşteri oluşturulamadı'
    );
  }

  static async updateCustomer(
    id: string,
    customerData: CustomerUpdate
  ): Promise<Customer> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    // Güncelleme işlemi doğrudan 'customers' tablosuna yapılır.
    return this.handleUpdateRequest<Customer>(
      async () => supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .eq('user_id', user.id) // Sadece giriş yapan kullanıcının müşterisini güncelle
        .select() // Temel customer verisini seçer
        .single(),
      'Müşteri güncellenemedi veya erişim yetkiniz yok'
    );
  }

  static async deleteCustomer(id: string): Promise<void> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleDeleteRequest(
      async () => supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id), // Sadece giriş yapan kullanıcının müşterisini sil
      'Müşteri silinemedi veya erişim yetkiniz yok'
    );
  }

  static async searchCustomers(query: string): Promise<Customer[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const { data, error } = await supabase
      .from('customers_extended_details') // View üzerinden arama yapabiliriz
        .select('*')
        .eq('user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerini ara
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('customer_created_at', { ascending: false });

    if (error) {
      console.error('Error searching customers from view:', error);
      throw new Error('Müşteri araması yapılamadı');
    }
    return (data || []).map(mapCustomerFromView);
  }

  static async getCustomerVehicles(customerId: string): Promise<Customer> {
    return this.handleRequest<Customer>(
      async () => supabase
        .from('customers')
        .select(`
          *,
          vehicles (*)
        `)
        .eq('id', customerId)
        .single(),
      'Müşteri araçları getirilemedi'
    );
  }

  static async getCustomerAppointments(customerId: string): Promise<Customer> {
    return this.handleRequest<Customer>(
      async () => supabase
        .from('customers')
        .select(`
          *,
          appointments (*)
        `)
        .eq('id', customerId)
        .single(),
      'Müşteri randevuları getirilemedi'
    );
  }

  static async getCustomersWithOutstandingDebt(): Promise<Customer[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const { data, error } = await supabase
      .from('customers_extended_details')
      .select('*')
      .eq('user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerini getir
      .gt('total_outstanding_balance_from_jobs', 0) // GÜNCELLENDİ
      .order('total_outstanding_balance_from_jobs', { ascending: false }); // GÜNCELLENDİ

    if (error) {
      console.error('Error fetching customers with outstanding debt from view:', error);
      throw new Error('Borçlu müşteriler getirilemedi');
    }
    return (data || []).map(mapCustomerFromView);
  }
} 