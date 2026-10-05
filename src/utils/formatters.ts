/**
 * Tarihi Türkçe formatında görüntüler
 * @param dateString ISO tarih formatında string
 * @returns Formatlanmış tarih (örn: 22.03.2024)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR');
};

/**
 * Para birimini TL formatında görüntüler
 * @param amount Tutar
 * @returns Formatlanmış tutar (örn: 1.250,00 ₺)
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  });
};

/**
 * Telefon numarasını formatlı gösterir
 * @param phone Telefon numarası
 * @returns Formatlanmış telefon (örn: (555) 123 45 67)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Sadece rakamları al
  const cleaned = phone.replace(/\D/g, '');
  
  // Eğer 10 haneli değilse olduğu gibi döndür
  if (cleaned.length !== 10) return phone;
  
  // (5XX) XXX XX XX formatında döndür
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
};

/**
 * Araç plakasını formatlı gösterir
 * @param plate Plaka
 * @returns Formatlanmış plaka (örn: 34 ABC 123)
 */
export const formatLicensePlate = (plate: string): string => {
  // Boşlukları kaldır, harfleri büyük harf yap
  const cleaned = plate.replace(/\s/g, '').toUpperCase();
  
  // İl kodu (1-2 rakam) + harf (1-3) + rakam (1-4) formatını kontrol et
  const match = cleaned.match(/^(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  
  if (!match) return plate;
  
  return `${match[1]} ${match[2]} ${match[3]}`;
}; 