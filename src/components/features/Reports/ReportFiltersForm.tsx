import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useCustomers } from '../../../hooks/useCustomers';
import { ReportFilters } from '../../../types/reports';

interface ReportFiltersFormProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

export const ReportFiltersForm: React.FC<ReportFiltersFormProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  
  // Müşteri listesini getir
  const { customers } = useCustomers({ 
    sortBy: 'full_name', 
    sortOrder: 'asc' 
  });

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: ReportFilters = {
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end: new Date().toISOString(),
      },
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm">
      <VStack spacing={4}>
        <Flex gap={4} width="full" wrap="wrap">
          <FormControl>
            <FormLabel>Başlangıç Tarihi</FormLabel>
            <Input
              type="date"
              value={localFilters.dateRange?.start?.split('T')[0] || ''}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  dateRange: {
                    ...localFilters.dateRange,
                    start: new Date(e.target.value).toISOString(),
                    end: localFilters.dateRange?.end || new Date().toISOString(),
                  },
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bitiş Tarihi</FormLabel>
            <Input
              type="date"
              value={localFilters.dateRange?.end?.split('T')[0] || ''}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  dateRange: {
                    start: localFilters.dateRange?.start || new Date().toISOString(),
                    end: new Date(e.target.value).toISOString(),
                  },
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Müşteri Seçimi</FormLabel>
            <Select
              value={localFilters.customerId || ''}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  customerId: e.target.value || undefined,
                })
              }
            >
              <option value="">Tüm Müşteriler</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </Select>
          </FormControl>
        </Flex>

        <Flex gap={2}>
          <Button colorScheme="blue" onClick={handleApplyFilters}>
            Filtreleri Uygula
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Sıfırla
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}; 