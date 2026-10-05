import DOMPurify from 'dompurify';
import { z } from 'zod';

// XSS koruması için input temizleme fonksiyonu
const sanitizeInput = (val: unknown) => {
  if (typeof val === 'string') {
    return DOMPurify.sanitize(val.trim());
  }
  return val;
};

// Genel doğrulama mesajları
const messages = {
  required: 'Bu alan zorunludur',
  email: 'Geçersiz e-posta adresi',
  phone: 'Geçersiz telefon numarası (10 haneli olmalı)',
  min: (min: number) => `En az ${min} karakter olmalı`,
  max: (max: number) => `En fazla ${max} karakter olabilir`,
};

// Müşteri şeması
export const customerSchema = z.object({
  full_name: z.string({ required_error: messages.required })
    .min(2, messages.min(2))
    .max(100, messages.max(100))
    .transform(sanitizeInput),
  
  phone: z.string({ required_error: messages.required })
    .regex(/^[0-9]{10,11}$/, messages.phone)
    .transform(sanitizeInput),
  
  email: z.string()
    .email(messages.email)
    .optional()
    .or(z.literal(''))
    .transform((val: string | null | undefined) => val ? sanitizeInput(val) : val),
  
  address: z.string()
    .max(500, messages.max(500))
    .optional()
    .or(z.literal(''))
    .transform((val: string | null | undefined) => val ? sanitizeInput(val) : val),

  notes: z.string()
    .max(1000, messages.max(1000))
    .optional()
    .or(z.literal(''))
    .transform((val: string | null | undefined) => val ? sanitizeInput(val) : val),
});

// Araç şeması
export const vehicleSchema = z.object({
  plate: z.string({ required_error: messages.required })
    .min(5, messages.min(5))
    .max(15, messages.max(15))
    .regex(/^[0-9A-Z\s]+$/, 'Plaka sadece harf, rakam ve boşluk içerebilir')
    .transform((val: string) => DOMPurify.sanitize(val.toUpperCase().trim())),

  brand: z.string({ required_error: messages.required })
    .min(2, messages.min(2))
    .max(50, messages.max(50))
    .transform(sanitizeInput),

  model: z.string({ required_error: messages.required })
    .min(1, messages.min(1))
    .max(50, messages.max(50))
    .transform(sanitizeInput),

  year: z.coerce.number()
    .min(1900, 'Yıl 1900\'den küçük olamaz')
    .max(new Date().getFullYear() + 1, 'Gelecek bir yıl girilemez')
    .optional(),

  color: z.string()
    .max(30, messages.max(30))
    .optional()
    .or(z.literal(''))
    .transform((val: string | null | undefined) => val ? sanitizeInput(val) : val),
    
  vin: z.string()
    .max(17, messages.max(17))
    .optional()
    .or(z.literal(''))
    .transform((val: string | null | undefined) => val ? sanitizeInput(val) : val),
});

// İş/Servis şeması
export const jobSchema = z.object({
  customer_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  
  job_description: z.string({ required_error: messages.required })
    .min(5, messages.min(5))
    .max(500, messages.max(500))
    .transform(sanitizeInput),
    
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  
  estimated_cost: z.coerce.number()
    .min(0, 'Tutar 0\'dan küçük olamaz')
    .optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type JobInput = z.infer<typeof jobSchema>;

