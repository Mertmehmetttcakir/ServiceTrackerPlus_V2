import { Button } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { clearAllCache } from '../../utils/cacheUtils';

export const CacheDebugButton: React.FC = () => {
  const queryClient = useQueryClient();

  const handleClearCache = () => {
    // Tüm cache'i temizle
    clearAllCache(queryClient);
    
    // Sayfayı yenile
    window.location.reload();
  };

  // Sadece development modunda göster
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Button
      size="sm"
      colorScheme="red"
      variant="outline"
      onClick={handleClearCache}
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={1000}
    >
      Cache Temizle
    </Button>
  );
}; 