export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTimeForInput = (date: Date): string => {
  return date.toTimeString().split(':').slice(0, 2).join(':');
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

export const getWeekStart = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi başlangıç
  return new Date(result.setDate(diff));
};

export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  return addDays(weekStart, 6);
};

export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Timezone güvenli tarih formatı (YYYY-MM-DD)
 * toISOString() kullanmak yerine manuel formatla
 */
export const formatDateSafe = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Timezone güvenli saat formatı (HH:MM)
 */
export const formatTimeSafe = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Tarih ve saat bilgilerini ayrıştır (timezone güvenli)
 */
export const parseAppointmentDateTime = (dateTimeString: string) => {
  const appointmentDateTime = parseDateSafe(dateTimeString);
  
  return {
    date: formatDateSafe(appointmentDateTime),
    startTime: formatTimeSafe(appointmentDateTime),
    endTime: formatTimeSafe(new Date(appointmentDateTime.getTime() + 60 * 60 * 1000))
  };
};

/**
 * Tarih ve saat bilgilerini timezone güvenli şekilde birleştir
 * UTC formatında döndürür (PostgreSQL timestamp with time zone için uygun)
 */
export const combineDateTime = (date: string, time: string): string => {
  // date: "2024-01-15" formatında
  // time: "14:30" formatında
  
  // UTC formatında döndür - PostgreSQL timestamptz için
  return new Date(`${date}T${time}:00`).toISOString();
};

/**
 * Timezone güvenli şekilde tarih string'ini ayrıştır
 * toISOString() yerine kullanılır
 */
export const parseDateSafe = (dateString: string): Date => {
  // UTC offset olmayan tarihleri yerel saat diliminde ayrıştır
  if (!dateString.includes('T') && !dateString.includes('Z')) {
    // "YYYY-MM-DD" formatı
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // "YYYY-MM-DDTHH:MM:SS" formatı (timezone olmadan)
  if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second = 0] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  // Diğer durumlar için normal ayrıştırma
  return new Date(dateString);
};

/**
 * Timezone güvenli tarih oluşturma
 */
export const createDateSafe = (year: number, month: number, day: number, hour: number = 0, minute: number = 0): Date => {
  return new Date(year, month - 1, day, hour, minute);
};

/**
 * Tarihi timezone güvenli şekilde formatla (giriş alanları için)
 */
export const formatDateForInputSafe = (date: Date): string => {
  return formatDateSafe(date);
};

/**
 * Saati timezone güvenli şekilde formatla (giriş alanları için)
 */
export const formatTimeForInputSafe = (date: Date): string => {
  return formatTimeSafe(date);
};

/**
 * Timezone güvenli şekilde bugünü al
 */
export const getTodaySafe = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Timezone güvenli şekilde şu anki tarih/saati al
 */
export const getNowSafe = (): Date => {
  return new Date();
};

/**
 * Date objelerini timezone güvenli şekilde karşılaştır
 */
export const compareDatesSafe = (date1: Date, date2: Date): number => {
  const time1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime();
  const time2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime();
  return time1 - time2;
};

/**
 * Tarihin geçmiş olup olmadığını kontrol et (timezone güvenli)
 */
export const isPastDateSafe = (date: Date): boolean => {
  const today = getTodaySafe();
  return compareDatesSafe(date, today) < 0;
};

/**
 * Tarihin bugün olup olmadığını kontrol et (timezone güvenli)
 */
export const isTodaySafe = (date: Date): boolean => {
  const today = getTodaySafe();
  return compareDatesSafe(date, today) === 0;
};

/**
 * Timezone güvenli şekilde tarih string'ini görüntüleme formatına çevir
 */
export const formatDateDisplaySafe = (dateString: string): string => {
  const date = parseDateSafe(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Timezone güvenli şekilde saat string'ini görüntüleme formatına çevir
 */
export const formatTimeDisplaySafe = (dateString: string): string => {
  const date = parseDateSafe(dateString);
  return formatTimeSafe(date);
};

/**
 * Timezone DEBUG - Geliştirme aşamasında timezone dönüşümlerini test etmek için
 */
export const debugTimezone = () => {
  const now = new Date();
  const testDate = '2024-01-15';
  const testTime = '14:30';
  
  console.log('=== TIMEZONE DEBUG ===');
  console.log('Şu anki tarih/saat:', now);
  console.log('Timezone offset (dakika):', now.getTimezoneOffset());
  console.log('Test tarih:', testDate);
  console.log('Test saat:', testTime);
  console.log('combineDateTime sonucu:', combineDateTime(testDate, testTime));
  console.log('UTC ISO string:', new Date(`${testDate}T${testTime}:00`).toISOString());
  console.log('Lokal string:', new Date(`${testDate}T${testTime}:00`).toString());
  console.log('===================');
}; 