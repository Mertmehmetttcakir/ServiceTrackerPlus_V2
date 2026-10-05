import { NextFunction, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Yetkilendirme başlığı eksik' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token eksik' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    // Kullanıcı bilgisini request nesnesine ekle
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Rol bazlı yetkilendirme middleware'i
export const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({ error: 'Yetki hatası' });
      }

      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
      }

      next();
    } catch (error) {
      console.error('Role middleware hatası:', error);
      res.status(500).json({ error: 'Sunucu hatası' });
    }
  };
};

export const requireAdmin = roleMiddleware(['admin']);
export const requireManager = roleMiddleware(['admin', 'manager']);
export const requireTechnician = roleMiddleware(['admin', 'manager', 'technician']); 