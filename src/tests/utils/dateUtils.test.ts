import { describe, expect, it } from 'vitest';
import {
    addDays,
    addMonths,
    addWeeks,
    combineDateTime,
    createDateSafe,
    formatDate,
    formatDateDisplaySafe,
    formatDateForInput,
    formatDateSafe,
    formatDateTime,
    formatTime,
    formatTimeDisplaySafe,
    formatTimeSafe,
    getMonthEnd,
    getMonthStart,
    getTodaySafe,
    getWeekEnd,
    getWeekStart,
    isPastDateSafe,
    isSameDay,
    isToday,
    parseDateSafe
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('tarihi doğru formatta döndürür', () => {
      const dateString = '2024-03-20T10:30:00Z';
      const result = formatDate(dateString);
      expect(result).toContain('2024');
      expect(result).toContain('20');
    });

    it('türkçe formatında tarih döndürür', () => {
      const dateString = '2024-03-20T10:30:00Z';
      const result = formatDate(dateString);
      expect(result).toMatch(/\d+ \w+ \d+/);
    });
  });

  describe('formatTime', () => {
    it('saati doğru formatta döndürür', () => {
      const dateString = '2024-03-20T14:30:00Z';
      const result = formatTime(dateString);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDateTime', () => {
    it('tarih ve saati birlikte formatlar', () => {
      const dateString = '2024-03-20T14:30:00Z';
      const result = formatDateTime(dateString);
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDateForInput', () => {
    it('HTML input için tarih formatlar', () => {
      const date = new Date(2024, 2, 20); // Mart 20, 2024
      const result = formatDateForInput(date);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('addDays', () => {
    it('belirtilen gün sayısını ekler', () => {
      const date = new Date('2024-03-20');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(25);
      expect(result.getMonth()).toBe(2); // Mart = 2
    });

    it('ay sınırını geçebilir', () => {
      const date = new Date('2024-03-30');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(3); // Nisan = 3
      expect(result.getDate()).toBe(4);
    });
  });

  describe('addWeeks', () => {
    it('belirtilen hafta sayısını ekler', () => {
      const date = new Date('2024-03-20');
      const result = addWeeks(date, 2);
      expect(result.getDate()).toBe(3); // 20 + 14 = 34 -> Nisan 3
      expect(result.getMonth()).toBe(3);
    });
  });

  describe('addMonths', () => {
    it('belirtilen ay sayısını ekler', () => {
      const date = new Date('2024-03-20');
      const result = addMonths(date, 2);
      expect(result.getMonth()).toBe(4); // Mayıs = 4
      expect(result.getDate()).toBe(20);
    });
  });

  describe('isToday', () => {
    it('bugünün tarihini doğru tespit eder', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('dünü bugün olarak tespit etmez', () => {
      const yesterday = addDays(new Date(), -1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('aynı günleri doğru tespit eder', () => {
      const date1 = new Date('2024-03-20T10:00:00');
      const date2 = new Date('2024-03-20T15:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('farklı günleri doğru tespit eder', () => {
      const date1 = new Date('2024-03-20');
      const date2 = new Date('2024-03-21');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('formatDateSafe', () => {
    it('timezone güvenli tarih formatı döndürür', () => {
      const date = new Date(2024, 2, 20); // Mart 20, 2024
      const result = formatDateSafe(date);
      expect(result).toBe('2024-03-20');
    });
  });

  describe('formatTimeSafe', () => {
    it('timezone güvenli saat formatı döndürür', () => {
      const date = new Date(2024, 2, 20, 14, 30);
      const result = formatTimeSafe(date);
      expect(result).toBe('14:30');
    });
  });

  describe('parseDateSafe', () => {
    it('tarih string\'ini doğru ayrıştırır', () => {
      const dateString = '2024-03-20';
      const result = parseDateSafe(dateString);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // Mart = 2
      expect(result.getDate()).toBe(20);
    });

    it('tarih ve saat string\'ini doğru ayrıştırır', () => {
      const dateString = '2024-03-20T14:30:00';
      const result = parseDateSafe(dateString);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });
  });

  describe('combineDateTime', () => {
    it('tarih ve saati birleştirir', () => {
      const date = '2024-03-20';
      const time = '14:30';
      const result = combineDateTime(date, time);
      
      // ISO string formatını kontrol et (timezone offset olabilir)
      expect(result).toContain('2024-03-20');
      expect(result).toMatch(/T\d{2}:30:00/); // Saat kısmı timezone'dan dolayı değişebilir
    });
  });

  describe('timezone-safe roundtrip', () => {
    it('combineDateTime ile oluşturulan ISO, lokal saati korur', () => {
      const date = '2024-01-15';
      const time = '14:30';

      const iso = combineDateTime(date, time);
      const parsed = new Date(iso);

      // Date objesi lokal timezone'da tekrar okunduğunda saat aynı kalmalı
      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(0); // Ocak = 0
      expect(parsed.getDate()).toBe(15);
      expect(parsed.getHours()).toBe(14);
      expect(parsed.getMinutes()).toBe(30);
    });
  });

  describe('week operations', () => {
    it('haftanın başlangıcını bulur', () => {
      const date = new Date('2024-03-20'); // Çarşamba
      const result = getWeekStart(date);
      expect(result.getDay()).toBe(1); // Pazartesi
    });

    it('haftanın sonunu bulur', () => {
      const date = new Date('2024-03-20'); // Çarşamba
      const result = getWeekEnd(date);
      expect(result.getDay()).toBe(0); // Pazar
    });
  });

  describe('month operations', () => {
    it('ayın başlangıcını bulur', () => {
      const date = new Date('2024-03-20');
      const result = getMonthStart(date);
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(2); // Mart
    });

    it('ayın sonunu bulur', () => {
      const date = new Date('2024-03-20');
      const result = getMonthEnd(date);
      expect(result.getDate()).toBe(31); // Mart 31 gün
      expect(result.getMonth()).toBe(2);
    });
  });

  describe('createDateSafe', () => {
    it('timezone güvenli tarih oluşturur', () => {
      const result = createDateSafe(2024, 3, 20, 14, 30);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // Mart = 2
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });
  });

  describe('getTodaySafe', () => {
    it('bugünün tarihini timezone güvenli şekilde döndürür', () => {
      const result = getTodaySafe();
      const now = new Date();
      expect(result.getFullYear()).toBe(now.getFullYear());
      expect(result.getMonth()).toBe(now.getMonth());
      expect(result.getDate()).toBe(now.getDate());
    });
  });

  describe('isPastDateSafe', () => {
    it('geçmiş tarihi doğru tespit eder', () => {
      const yesterday = addDays(new Date(), -1);
      expect(isPastDateSafe(yesterday)).toBe(true);
    });

    it('gelecek tarihi doğru tespit eder', () => {
      const tomorrow = addDays(new Date(), 1);
      expect(isPastDateSafe(tomorrow)).toBe(false);
    });
  });

  describe('formatDateDisplaySafe', () => {
    it('gösterim için güvenli tarih formatlar', () => {
      const dateString = '2024-03-20T14:30:00Z';
      const result = formatDateDisplaySafe(dateString);
      expect(result).toContain('2024');
    });
  });

  describe('formatTimeDisplaySafe', () => {
    it('gösterim için güvenli saat formatlar', () => {
      const dateString = '2024-03-20T14:30:00Z';
      const result = formatTimeDisplaySafe(dateString);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });
}); 