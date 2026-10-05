import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Stack,
  Switch,
} from '@chakra-ui/react';
import React from 'react';
import { CustomerFilters as ICustomerFilters } from '../../../types/customer';

interface CustomerFiltersProps {
  filters: ICustomerFilters;
  onFiltersChange: (filters: ICustomerFilters) => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onToggle = () => setIsOpen((prev) => !prev);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const switchInput = e.target as HTMLInputElement;
      onFiltersChange({
        ...filters,
        [name]: switchInput.checked,
      });
    } else {
      onFiltersChange({
        ...filters,
        [name]: value,
      });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [
      ICustomerFilters['sortBy'],
      ICustomerFilters['sortOrder']
    ];
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      search: '',
      sortBy: 'full_name',
      sortOrder: 'asc',
      status: undefined,
      hasVehicle: undefined,
    });
  };

  return (
    <Box mb={6}>
      <Stack spacing={4}>
        <HStack justify="space-between">
          <FormControl maxW={{ base: 'full', md: '300px' }}>
            <Input
              name="search"
              placeholder="Müşteri ara..."
              value={filters.search || ''}
              onChange={handleChange}
            />
          </FormControl>
          <Button
            rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onToggle}
            variant="ghost"
          >
            Gelişmiş Filtreler
          </Button>
        </HStack>

        <Collapse in={isOpen}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            align="flex-start"
            p={4}
            bg="gray.50"
            rounded="md"
          >
            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel>Sıralama</FormLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={handleSortChange}
              >
                <option value="full_name-asc">İsim (A-Z)</option>
                <option value="full_name-desc">İsim (Z-A)</option>
                <option value="createdAt-desc">En Yeni</option>
                <option value="createdAt-asc">En Eski</option>
                <option value="lastAppointment-desc">Son Randevu</option>
                <option value="totalAppointments-desc">Randevu Sayısı</option>
              </Select>
            </FormControl>

            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel>Durum</FormLabel>
              <Select
                name="status"
                value={filters.status || ''}
                onChange={handleChange}
              >
                <option value="">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Sadece Araç Sahipleri</FormLabel>
              <Switch
                name="hasVehicle"
                isChecked={filters.hasVehicle}
                onChange={handleChange}
              />
            </FormControl>

            <Button
              colorScheme="gray"
              variant="outline"
              onClick={handleReset}
              alignSelf="center"
              size="sm"
              width="100%"
              maxW="150px"
            >
              Filtreleri Sıfırla
            </Button>
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}; 