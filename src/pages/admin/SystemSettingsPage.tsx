import {
    Box,
    Flex,
    Heading,
    Spinner,
    Text
} from '@chakra-ui/react';
import React from 'react';
import { SystemSettings } from '../../components/features/Settings/SystemSettings';
import { useUserRole } from '../../hooks/useUserRole';

export const SystemSettingsPage: React.FC = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  if (roleLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!isAdmin) {
    return (
      <Box p={4}>
        <Heading size="lg" color="red.500">Erişim Reddedildi</Heading>
        <Text mt={2}>Bu sayfayı görüntülemek için admin yetkisi gereklidir.</Text>
      </Box>
    );
  }

  return <SystemSettings />;
}; 