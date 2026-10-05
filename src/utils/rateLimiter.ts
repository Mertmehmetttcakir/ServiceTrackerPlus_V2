interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Verilen anahtar için limit kontrolü yapar
   * @param key IP adresi veya kullanıcı ID'si
   * @param config Limit konfigürasyonu
   * @returns İşlem limiti aşmadıysa true, aştıysa false
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Mevcut istekleri al
    const userRequests = this.requests.get(key) || [];
    
    // Pencere dışındaki eski istekleri temizle
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // Limit kontrolü
    if (recentRequests.length >= config.maxRequests) {
      // Map'i güncelle (temizlenmiş haliyle)
      this.requests.set(key, recentRequests);
      return false;
    }
    
    // Yeni isteği ekle
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
  
  /**
   * Belirli bir anahtar için limitleri sıfırlar
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Süresi dolmuş tüm kayıtları temizler (Garbage Collection)
   * Periyodik olarak çağrılabilir
   */
  cleanup(maxWindowMs: number = 15 * 60 * 1000): void {
    const now = Date.now();
    const windowStart = now - maxWindowMs;

    this.requests.forEach((timestamps, key) => {
      const valid = timestamps.filter(t => t > windowStart);
      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    });
  }
}

export const rateLimiter = new RateLimiter();

// Önceden tanımlı limitler
export const RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 15 dakikada 5 deneme
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // Dakikada 100 istek
  search: { maxRequests: 30, windowMs: 60 * 1000 }, // Dakikada 30 arama
};

