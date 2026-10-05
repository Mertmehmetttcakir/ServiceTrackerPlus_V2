import {
  Box,
  Divider,
  Icon,
  Link,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import {
  FiBarChart2,
  FiCalendar,
  FiClipboard,
  FiDollarSign,
  FiHome,
  FiSettings,
  FiTool,
  FiUsers,
  FiTruck
} from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';

interface NavItemProps {
  icon: any;
  children: string;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Box
        display="flex"
        alignItems="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : undefined}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
        />
        <Text>{children}</Text>
      </Box>
    </Link>
  );
};

interface SidebarProps {
  /**
   * 'desktop' → layout içinde normal akışta duran sidebar
   * 'mobile'  → overlay içinde sabit konumlu sidebar
   */
  variant?: 'desktop' | 'mobile';
}

export const Sidebar: React.FC<SidebarProps> = ({ variant = 'desktop' }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isAdmin, canManageCustomers } = useUserRole();

  const isMobileVariant = variant === 'mobile';

  return (
    <Box
      as="nav"
      position={isMobileVariant ? 'fixed' : 'relative'}
      top={isMobileVariant ? '0' : 'auto'}
      left={isMobileVariant ? '0' : 'auto'}
      h="100vh"
      w="64"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing="1" pt="5">
        <NavItem icon={FiHome} to="/dashboard">
          AnaSayfa
        </NavItem>
        
        {canManageCustomers && (
        <NavItem icon={FiUsers} to="/customers">
          Müşteriler
        </NavItem>
        )}
        
        <NavItem icon={FiCalendar} to="/appointments">
          Randevular
        </NavItem>
        
        <NavItem icon={FiTool} to="/technicians">
          Teknisyenler
        </NavItem>
        <NavItem icon={FiClipboard} to="/services">
          Servis Geçmişi
        </NavItem>
        <NavItem icon={FiBarChart2} to="/reports">
          Raporlar
        </NavItem>
        
        {isAdmin && (
          <NavItem icon={FiDollarSign} to="/finance">
            Kasa / Finans
          </NavItem>
        )}

        {isAdmin && (
          <NavItem icon={FiTruck} to="/suppliers">
            Tedarikçiler
          </NavItem>
        )}
        
        {isAdmin && (
          <>
            <Divider my={2} />
            <Text px={4} py={2} fontSize="sm" fontWeight="bold" color="gray.500">
              YÖNETİM
            </Text>

            <NavItem icon={FiHome} to="/admin/company">
              Şirket Bilgileri
            </NavItem>
            <NavItem icon={FiSettings} to="/admin/settings">
              Sistem Ayarları
            </NavItem>
          </>
        )}
      </VStack>
    </Box>
  );
}; 