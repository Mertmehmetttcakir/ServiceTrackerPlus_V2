import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import React, { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <Flex h="100vh" flexDirection="column">
      <Header onToggleSidebar={handleToggleSidebar} />
      <Flex flex="1" overflow="hidden">
        {/* Masaüstü için sabit sidebar */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Sidebar />
        </Box>

        <Box
          as="main"
          flex="1"
          p="4"
          overflow="auto"
        >
          {children || <Outlet />}
        </Box>

        {/* Mobil için açılıp kapanan overlay sidebar */}
        {isMobile && isSidebarOpen && (
          <Box
            position="fixed"
            inset="0"
            bg="blackAlpha.600"
            zIndex={1400}
            onClick={handleToggleSidebar}
          >
            <Sidebar />
          </Box>
        )}
      </Flex>
    </Flex>
  );
}; 