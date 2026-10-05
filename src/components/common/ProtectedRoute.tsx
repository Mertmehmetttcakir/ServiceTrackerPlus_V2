import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermission }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Yükleme durumunda spinner göster
  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Yükleniyor...</Text>
        </VStack>
      </Center>
    );
  }

  // Giriş yapılmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Eğer özel bir yetki gerekiyorsa kontrol et
  if (requiredPermission && user?.permissions?.indexOf(requiredPermission) === -1) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="xl" fontWeight="bold" color="red.500">
          Erişim Reddedildi
        </Text>
        <Text mt={4}>
          Bu sayfayı görüntülemek için gereken yetkiye sahip değilsiniz.
        </Text>
      </Box>
    );
  }

  // Koşullar sağlanıyorsa içeriği göster
  return <Outlet />;
}; 