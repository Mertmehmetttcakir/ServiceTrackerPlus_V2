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
    useDisclosure,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { AppointmentFilters as IAppointmentFilters } from '../../../types/appointment';

interface AppointmentFiltersProps {
  filters: IAppointmentFilters;
  onFiltersChange: (filters: IAppointmentFilters) => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { isOpen, onToggle } = useDisclosure();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onFiltersChange({
      ...filters,
      [name]: value || undefined,
    });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onFiltersChange({
      ...filters,
      [name]: value,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [
      IAppointmentFilters['sortBy'],
      IAppointmentFilters['sortOrder']
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
      startDate: undefined,
      endDate: undefined,
      status: undefined,
      technicianId: undefined,
      customerId: undefined,
      serviceType: undefined,
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  return (
    <Box mb={6}>
      <Stack spacing={4}>
        <HStack justify="space-between">
          <FormControl maxW={{ base: 'full', md: '300px' }}>
            <Input
              name="search"
              placeholder="Müşteri veya araç ara..."
              value={filters.search || ''}
              onChange={handleChange}
            />
          </FormControl>
          <Button
            rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
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
              <FormLabel>Başlangıç Tarihi</FormLabel>
              <Input
                name="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={handleDateChange}
              />
            </FormControl>

            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel>Bitiş Tarihi</FormLabel>
              <Input
                name="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={handleDateChange}
              />
            </FormControl>

            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel>Durum</FormLabel>
              <Select
                name="status"
                value={filters.status || ''}
                onChange={handleChange}
              >
                <option value="">Tümü</option>
                <option value="pending">Bekliyor</option>
                <option value="confirmed">Onaylandı</option>
                <option value="in-progress">İşlemde</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </Select>
            </FormControl>

            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel>Servis Tipi</FormLabel>
              <Select
                name="serviceType"
                value={filters.serviceType || ''}
                onChange={handleChange}
              >
                <option value="">Tümü</option>
                <option value="periodic">Periyodik Bakım</option>
                <option value="repair">Onarım</option>
                <option value="inspection">Kontrol</option>
                <option value="other">Diğer</option>
              </Select>
            </FormControl>

            <FormControl maxW={{ base: 'full', md: '200px' }}>
              <FormLabel>Sıralama</FormLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={handleSortChange}
              >
                <option value="date-desc">Tarih (Yeni-Eski)</option>
                <option value="date-asc">Tarih (Eski-Yeni)</option>
                <option value="status-asc">Durum (A-Z)</option>
                <option value="status-desc">Durum (Z-A)</option>
                <option value="customerName-asc">Müşteri (A-Z)</option>
                <option value="customerName-desc">Müşteri (Z-A)</option>
              </Select>
            </FormControl>

            <Button
              colorScheme="gray"
              variant="outline"
              onClick={handleReset}
              alignSelf="flex-end"
            >
              Filtreleri Sıfırla
            </Button>
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}; 