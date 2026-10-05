import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

interface UseAuthRedirectOptions {
  redirectAuthenticated?: string;
  redirectUnauthenticated?: string;
}

/**
 * Kimlik doğrulama durumuna göre yönlendirme yapan hook
 * @param options - Yönlendirme seçenekleri
 */
export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && options.redirectAuthenticated) {
      navigate(options.redirectAuthenticated);
    } else if (!isAuthenticated && options.redirectUnauthenticated) {
      navigate(options.redirectUnauthenticated);
    }
  }, [isAuthenticated, isLoading, navigate, options.redirectAuthenticated, options.redirectUnauthenticated]);

  return { isAuthenticated, isLoading };
}; 