import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CompanyService } from '../services/companyService';
import { CompanyCreate, CompanyUpdate } from '../types/company';

const COMPANY_QUERY_KEY = 'company';

/**
 * Şirket profilini getirir
 */
export const useCompanyProfile = () => {
  return useQuery({
    queryKey: [COMPANY_QUERY_KEY, 'profile'],
    queryFn: CompanyService.getCompanyProfile,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
  });
};

/**
 * Şirket profili oluşturur
 */
export const useCreateCompanyProfile = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CompanyCreate) => CompanyService.createCompanyProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData([COMPANY_QUERY_KEY, 'profile'], data);
      toast({
        title: 'Başarılı',
        description: 'Şirket profili oluşturuldu',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Şirket profili oluşturulamadı',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Şirket profilini günceller
 */
export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CompanyUpdate) => CompanyService.updateCompanyProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData([COMPANY_QUERY_KEY, 'profile'], data);
      queryClient.invalidateQueries({ queryKey: [COMPANY_QUERY_KEY] });
      toast({
        title: 'Başarılı',
        description: 'Şirket profili güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Şirket profili güncellenemedi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Logo yükler
 */
export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (file: File) => CompanyService.uploadLogo(file),
    onSuccess: async (logoUrl) => {
      // Şirket profilini yeni logo URL'i ile güncelle
      try {
        await CompanyService.updateCompanyProfile({ logo_url: logoUrl });
        queryClient.invalidateQueries({ queryKey: [COMPANY_QUERY_KEY] });
        toast({
          title: 'Başarılı',
          description: 'Logo başarıyla yüklendi',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Uyarı',
          description: 'Logo yüklendi ancak profil güncellenemedi',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Logo yüklenemedi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Logo siler
 */
export const useDeleteLogo = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => CompanyService.deleteLogo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_QUERY_KEY] });
      toast({
        title: 'Başarılı',
        description: 'Logo başarıyla silindi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Logo silinemedi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
}; 