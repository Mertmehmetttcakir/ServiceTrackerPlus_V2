import { AppointmentCreate, AppointmentFormData } from '../types/appointment';

/**
 * Form verilerinden API isteği için gerekli verileri oluşturur
 */
export const formDataToAppointmentCreate = (formData: AppointmentFormData): AppointmentCreate => {
  // ISO 8601 formatında tam tarih-saat formatına dönüştür
  const appointmentDate = new Date(`${formData.date}T${formData.timeSlot.start}`).toISOString();
  
  return {
    customer_id: formData.customerId,
    vehicle_id: formData.vehicleId,
    appointment_date: formData.date,
    service_type: formData.serviceType,
    notes: formData.notes,
    status: 'pending', // Yeni oluşturulan randevular başlangıçta pending olarak işaretlenir
    timeSlot: formData.timeSlot,
    technician: formData.technicianId ? { 
      id: formData.technicianId, 
      name: '' // Geçici olarak boş isim
    } : undefined,
    recurrencePattern: formData.recurrencePattern
  };
};

/**
 * API'den gelen randevu verilerini form verilerine dönüştürür
 */
export const appointmentToFormData = (appointment: any): AppointmentFormData => {
  // API'den gelen randevuyu form verilerine dönüştür
  const date = new Date(appointment.appointment_date);
  
  return {
    customerId: appointment.customer_id,
    vehicleId: appointment.vehicle_id,
    date: date.toISOString().split('T')[0], // YYYY-MM-DD formatında tarih
    timeSlot: {
      start: date.toISOString().split('T')[1].substring(0, 5), // HH:MM formatında başlangıç saati
      end: new Date(date.getTime() + 60 * 60 * 1000).toISOString().split('T')[1].substring(0, 5), // 1 saat sonrası
    },
    serviceType: appointment.service_type as any,
    services: [],
    notes: appointment.notes,
  };
}; 