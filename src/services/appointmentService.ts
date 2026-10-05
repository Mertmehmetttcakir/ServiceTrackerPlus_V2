import { supabase } from '../lib/supabase';
import { Appointment, AppointmentCreate, AppointmentUpdate } from '../types/appointment';
import { combineDateTime, parseAppointmentDateTime } from '../utils/dateUtils';
import { BaseApiService } from './baseApiService';

export class AppointmentService extends BaseApiService {
  static async getAppointments(): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin randevularını getir
        .order('appointment_date', { ascending: true }),
      'Randevular getirilemedi'
    );
  }

  static async getAppointmentById(id: string): Promise<Appointment> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('id', id)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin randevularını getir
        .single(),
      'Randevu detayları getirilemedi'
    );
  }

  static async createAppointment(data: AppointmentCreate): Promise<Appointment> {
    return this.handleCreateRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .insert([data])
        .select(`
          *,
          customer:customers (id, full_name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .single(),
      'Randevu oluşturulamadı'
    );
  }

  static async updateAppointment(
    id: string,
    data: AppointmentUpdate
  ): Promise<Appointment> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleUpdateRequest<Appointment>(
      async () => {
        // Direkt güncelleme yap, RLS politikası kontrolü yapacak
        return supabase
          .from('appointments')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            customer:customers (id, full_name, phone),
            vehicle:vehicles (id, plate, brand, model)
          `)
          .single();
      },
      'Randevu güncellenemedi'
    );
  }

  static async deleteAppointment(id: string): Promise<void> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleDeleteRequest(
      async () => {
        // Önce randevunun mevcut kullanıcıya ait olup olmadığını kontrol et
        const { data: existing, error: checkError } = await supabase
          .from('appointments')
          .select(`
            *,
            customer:customers!inner (id, full_name, phone, user_id)
          `)
          .eq('id', id)
          .eq('customer.user_id', user.id)
          .single();

        if (checkError || !existing) {
          throw new Error('Randevu bulunamadı veya erişim yetkiniz yok');
        }

        // Silme işlemini yap
        return supabase
          .from('appointments')
          .delete()
          .eq('id', id);
      },
      'Randevu silinemedi'
    );
  }

  static async getCustomerAppointments(customerId: string): Promise<Appointment[]> {
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers (id, full_name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: true }),
      'Müşteri randevuları getirilemedi'
    );
  }

  static async getVehicleAppointments(vehicleId: string): Promise<Appointment[]> {
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers (id, full_name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('vehicle_id', vehicleId)
        .order('appointment_date', { ascending: true }),
      'Araç randevuları getirilemedi'
    );
  }

  static async getUpcomingAppointments(): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    // Timezone güvenli şu anki tarih/saat - UTC formatında
    const now = new Date().toISOString();
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin randevularını getir
        .gte('appointment_date', now)
        .order('appointment_date', { ascending: true }),
      'Yaklaşan randevular getirilemedi'
    );
  }

  static async getPastAppointments(): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    // Timezone güvenli şu anki tarih/saat - UTC formatında
    const now = new Date().toISOString();
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin randevularını getir
        .lt('appointment_date', now)
        .order('appointment_date', { ascending: false }),
      'Geçmiş randevular getirilemedi'
    );
  }

  static async createRecurringAppointments(data: AppointmentCreate): Promise<Appointment[]> {
    // Tekrarlanan randevular için basit bir implementasyon
    // Gerçek uygulamada daha karmaşık bir tekrarlama mantığı olmalıdır
    
    // İlk randevuyu oluştur
    const firstAppointment = await this.createAppointment(data);
    const appointments: Appointment[] = [firstAppointment];
    
    // Burada gerçek bir implementasyonda recurrence pattern'e göre
    // tekrarlanan randevular oluşturulacaktır.
    // Şimdilik sadece ilk randevuyu dönüyoruz.
    
    return appointments;
  }

  static async getAppointmentsByCustomerId(customerId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments_with_balance') // View'ı kullanıyoruz
      .select('*') // Veya sadece gerekli alanları: '*, customer:customers(*), vehicle:vehicles(*)' gibi
      .eq('customer_id', customerId)
      .order('appointment_date', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
    return data || [];
  }

  static async getRecentAppointments(limit: number = 50): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id)
        .order('appointment_date', { ascending: false })
        .limit(limit),
      'Son randevular getirilemedi'
    );
  }

  static async getFilteredAppointments(filters: any): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers!inner (id, full_name, phone, user_id),
        vehicle:vehicles (id, plate, brand, model)
      `)
      .eq('customer.user_id', user.id);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    return this.handleListRequest<Appointment>(
      async () => query.order('appointment_date', { ascending: false }),
      'Filtrelenmiş randevular getirilemedi'
    );
  }

  /**
   * Belirli bir tarih ve saat aralığında çakışan randevuları kontrol eder
   */
  static async checkAppointmentConflict(
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<{ hasConflict: boolean; conflictingAppointments: Appointment[] }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // Randevu tarihini tam tarih-saat formatına dönüştür
      const startDateTime = combineDateTime(appointmentDate, startTime);
      const endDateTime = combineDateTime(appointmentDate, endTime);

      let query = supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının randevuları
        .gte('appointment_date', new Date(`${appointmentDate}T00:00:00`).toISOString())
        .lt('appointment_date', new Date(`${appointmentDate}T23:59:59`).toISOString())
        .neq('status', 'cancelled'); // İptal edilmiş randevuları hariç tut

      // Güncelleme işleminde mevcut randevuyu hariç tut
      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Saat çakışması kontrolü
      const conflictingAppointments = (data || []).filter((appointment: any) => {
        const { startTime: appointmentStart, endTime: appointmentEnd } = parseAppointmentDateTime(appointment.appointment_date);

        // Zaman aralığı çakışması kontrolü
        return (
          (startTime >= appointmentStart && startTime < appointmentEnd) ||
          (endTime > appointmentStart && endTime <= appointmentEnd) ||
          (startTime <= appointmentStart && endTime >= appointmentEnd)
        );
      });

      return {
        hasConflict: conflictingAppointments.length > 0,
        conflictingAppointments: conflictingAppointments
      };

    } catch (error) {
      console.error('Randevu çakışması kontrolü başarısız:', error);
      throw new Error('Randevu çakışması kontrol edilemedi');
    }
  }

  /**
   * Belirli bir tarihteki mevcut randevuları ve uygun saatleri getirir
   */
  static async getAvailableTimeSlots(
    appointmentDate: string,
    duration: number = 60 // dakika cinsinden - her randevu 1 saat
  ): Promise<{ 
    busySlots: Array<{ start: string; end: string; appointment: Appointment }>;
    availableSlots: Array<{ start: string; end: string }>;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // O gündeki tüm randevuları getir
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, full_name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id)
        .gte('appointment_date', new Date(`${appointmentDate}T00:00:00`).toISOString())
        .lt('appointment_date', new Date(`${appointmentDate}T23:59:59`).toISOString())
        .neq('status', 'cancelled')
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      // Dolu saatleri hesapla - her randevu 1 saat sürer
      const busySlots = (data || []).map((appointment: any) => {
        const { startTime, endTime } = parseAppointmentDateTime(appointment.appointment_date);

        return {
          start: startTime,
          end: endTime,
          appointment: appointment
        };
      });

      // Çalışma saatleri (08:00 - 18:00 arası, 1 saatlik slotlar)
      const workingHours = { start: 8, end: 18 };
      const slotDuration = 60; // 1 saat (60 dakika)
      const availableSlots = [];

      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEndHour = hour + 1;
        
        // Çalışma saatleri dışına çıkma kontrolü
        if (slotEndHour > workingHours.end) break;
        
        const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:00`;

        // Bu slot dolu mu kontrol et
        const isSlotBusy = busySlots.some(busy => 
          (slotStart >= busy.start && slotStart < busy.end) ||
          (slotEnd > busy.start && slotEnd <= busy.end) ||
          (slotStart <= busy.start && slotEnd >= busy.end)
        );

        if (!isSlotBusy) {
          availableSlots.push({ start: slotStart, end: slotEnd });
        }
      }

      return { busySlots, availableSlots };

    } catch (error) {
      console.error('Uygun saatler getirilemedi:', error);
      throw new Error('Uygun saatler kontrol edilemedi');
    }
  }

  /**
   * Randevu oluştururken çakışma kontrolü ile oluştur
   */
  static async createAppointmentWithConflictCheck(data: AppointmentCreate): Promise<Appointment> {
    try {
      // Tarih ve saat bilgilerini ayır
      const { date: appointmentDate, startTime, endTime } = parseAppointmentDateTime(data.appointment_date);

      // Çakışma kontrolü yap
      const conflictCheck = await this.checkAppointmentConflict(
        appointmentDate,
        startTime,
        endTime
      );

      if (conflictCheck.hasConflict) {
        const conflictInfo = conflictCheck.conflictingAppointments
          .map(apt => `${apt.customer?.full_name} - ${parseAppointmentDateTime(apt.appointment_date).startTime}`)
          .join(', ');
        
        throw new Error(`Bu saatte zaten randevu mevcut: ${conflictInfo}`);
      }

      // Çakışma yoksa normal oluştur
      return await this.createAppointment(data);

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Randevu oluşturulamadı');
    }
  }

  /**
   * Randevu güncellerken çakışma kontrolü ile güncelle
   */
  static async updateAppointmentWithConflictCheck(
    id: string,
    data: AppointmentUpdate
  ): Promise<Appointment> {
    try {
      if (data.appointment_date) {
        // Tarih ve saat bilgilerini ayır
        const { date: appointmentDate, startTime, endTime } = parseAppointmentDateTime(data.appointment_date);
        
        // Çakışma kontrolü yap (mevcut randevuyu hariç tut)
        const conflictCheck = await this.checkAppointmentConflict(
          appointmentDate,
          startTime,
          endTime,
          id
        );

        if (conflictCheck.hasConflict) {
          const conflictInfo = conflictCheck.conflictingAppointments
            .map(apt => `${apt.customer?.full_name} - ${parseAppointmentDateTime(apt.appointment_date).startTime}`)
            .join(', ');
          
          throw new Error(`Bu saatte zaten randevu mevcut: ${conflictInfo}`);
        }
      }

      // Çakışma yoksa normal güncelle
      return await this.updateAppointment(id, data);

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Randevu güncellenemedi');
    }
  }
} 