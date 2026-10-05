import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export type UserRole = 'customer' | 'technician' | 'admin';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
}

export const useUserRole = () => {
  const { user, isAuthenticated } = useAuth();

  const { data: userProfile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: isAuthenticated && !!user?.id,
  });

  const isAdmin = userProfile?.role === 'admin';
  const isTechnician = userProfile?.role === 'technician';
  const isCustomer = userProfile?.role === 'customer';
  const canManageCustomers = isAdmin || isTechnician;
  const canManageAppointments = isAdmin || isTechnician;

  return {
    userProfile,
    role: userProfile?.role,
    isLoading,
    error,
    isAdmin,
    isTechnician,
    isCustomer,
    canManageCustomers,
    canManageAppointments,
  };
}; 