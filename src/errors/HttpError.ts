// HTTP hata sınıfı - hem frontend servislerinde hem de backend middleware'de
// kullanılmak üzere, express'e bağımlı olmadan ayrı dosyaya alındı.

export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = new.target.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}


