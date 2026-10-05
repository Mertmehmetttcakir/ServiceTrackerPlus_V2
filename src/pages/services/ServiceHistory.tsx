import { AddIcon, CalendarIcon, DownloadIcon, SearchIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAppointments } from '../../hooks/useAppointments';
import { useCustomers } from '../../hooks/useCustomers';
import { useAllJobs } from '../../hooks/useJobs';
import { useAllServiceHistory } from '../../hooks/useServiceHistory';
import { useVehicles } from '../../hooks/useVehicles';
import { Appointment } from '../../types/appointment';
import type { JobSummary } from '../../types/job';
import type { ServiceHistory as ServiceHistoryRow } from '../../types/serviceHistory';
import { formatDateDisplaySafe } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';

// Servis kayıt tipi (appointment tablosundan)
interface ServiceRecord {
  id: string;
  customer_id: string;
  vehicle_id: string;
  service_date: string;
  service_type: string;
  description?: string;
  cost: number;
  status: string;
  notes?: string;
  created_at: string;
  customer?: any;
  vehicle?: any;
  original?: Appointment | ServiceHistoryRow | JobSummary;
}

const ServiceHistory: React.FC = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  // Status normalizasyon fonksiyonu - hem İngilizce hem Türkçe formatları destekler
  const normalizeStatus = (status: string): string => {
    const statusMapping: Record<string, string> = {
      'pending': 'pending',
      'Beklemede': 'pending',
      'confirmed': 'confirmed',
      'Onaylandı': 'confirmed',
      'in-progress': 'in-progress',
      'İşlemde': 'in-progress',
      'completed': 'completed',
      'Tamamlandı': 'completed',
      'cancelled': 'cancelled',
      'İptal Edildi': 'cancelled',
    };
    return statusMapping[status] || status;
  };

  // Data hooks
  const { appointments, isLoading: isLoadingAppointments } = useAppointments();
  const { serviceRecords: dbServiceHistory, isLoading: isLoadingServiceHistory } = useAllServiceHistory();
  const { data: jobs, isLoading: isLoadingJobs } = useAllJobs();
  const { customers } = useCustomers({
    sortBy: 'full_name',
    sortOrder: 'asc'
  });
  const { vehicles } = useVehicles();

  // Randevuları ve servis geçmişi kayıtlarını ortak formata dönüştür
  const serviceRecords = useMemo((): ServiceRecord[] => {
    const records: ServiceRecord[] = [];

    if (appointments) {
      records.push(
        ...appointments.map((appointment) => ({
          id: appointment.id,
          customer_id: appointment.customer_id,
          vehicle_id: appointment.vehicle_id,
          service_date: appointment.appointment_date,
          service_type: appointment.service_type,
          description: appointment.notes || '',
          cost: appointment.total_cost || 0,
          status: appointment.status,
          notes: appointment.notes,
          created_at: appointment.created_at,
          customer: appointment.customer,
          vehicle: appointment.vehicle,
          original: appointment,
        })),
      );
    }

    if (dbServiceHistory) {
      records.push(
        ...dbServiceHistory.map((record: ServiceHistoryRow) => ({
          id: record.id,
          customer_id: record.customer_id,
          vehicle_id: record.vehicle_id,
          service_date: record.service_date,
          service_type: record.service_type,
          description: record.description,
          cost: record.cost,
          status: record.status,
          notes: record.notes,
          created_at: record.created_at,
          customer: record.customer,
          vehicle: record.vehicle,
          original: record,
        })),
      );
    }

    if (jobs && customers && vehicles) {
      const customerMap = new Map(customers.map((c) => [c.id, c]));
      const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

      // Sadece giriş yapan kullanıcının müşterilerine ait iş kayıtlarını ekle
      const filteredJobs = jobs.filter((job: JobSummary) =>
        customerMap.has(job.customer_id),
      );

      records.push(
        ...filteredJobs.map((job: JobSummary) => ({
          id: job.id,
          customer_id: job.customer_id,
          vehicle_id: job.vehicle_id || '',
          service_date: job.job_date,
          service_type: 'job',
          description: job.job_description,
          cost: job.total_cost,
          status: job.status,
          notes: job.notes || undefined,
          created_at: job.created_at,
          customer: customerMap.get(job.customer_id),
          vehicle: job.vehicle_id ? vehicleMap.get(job.vehicle_id) : undefined,
          original: job,
        })),
      );
    }

    // Tarihe göre sırala (en yeni önce)
    return records.sort(
      (a, b) =>
        new Date(b.service_date).getTime() - new Date(a.service_date).getTime(),
    );
  }, [appointments, dbServiceHistory, jobs, customers, vehicles]);

  // Filtrelenmiş kayıtlar
  const filteredRecords = useMemo(() => {
    return serviceRecords.filter((record) => {
      // Arama terimi filtresi
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = 
          record.customer?.full_name?.toLowerCase().includes(searchLower) ||
          record.vehicle?.plate?.toLowerCase().includes(searchLower) ||
          record.vehicle?.brand?.toLowerCase().includes(searchLower) ||
          record.vehicle?.model?.toLowerCase().includes(searchLower) ||
          record.service_type?.toLowerCase().includes(searchLower) ||
          record.description?.toLowerCase().includes(searchLower);
        
        if (!matches) return false;
      }

      // Müşteri filtresi
      if (selectedCustomer && record.customer_id !== selectedCustomer) {
        return false;
      }

      // Araç filtresi
      if (selectedVehicle && record.vehicle_id !== selectedVehicle) {
        return false;
      }

      // Durum filtresi
      if (statusFilter !== 'all') {
        const normalizedRecordStatus = normalizeStatus(record.status);
        const normalizedFilterStatus = normalizeStatus(statusFilter);
        
        if (normalizedRecordStatus !== normalizedFilterStatus) {
          return false;
        }
      }

      // Tarih aralığı filtresi
      if (dateRange.start) {
        const serviceDate = new Date(record.service_date);
        const startDate = new Date(dateRange.start);
        if (serviceDate < startDate) return false;
      }

      if (dateRange.end) {
        const serviceDate = new Date(record.service_date);
        const endDate = new Date(dateRange.end);
        if (serviceDate > endDate) return false;
      }

      return true;
    });
  }, [serviceRecords, searchTerm, selectedCustomer, selectedVehicle, statusFilter, dateRange]);

  // İstatistikler (filtrelenmiş kayıtlara göre)
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const pending = filteredRecords.filter((r) => normalizeStatus(r.status) === 'pending').length;
    const inProgress = filteredRecords.filter((r) => normalizeStatus(r.status) === 'in-progress').length;
    const completed = filteredRecords.filter((r) => normalizeStatus(r.status) === 'completed').length;

    // Toplam gelir: filtrelenmiş tüm kayıtların tutar toplamı
    const totalRevenue = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

    const thisMonth = filteredRecords.filter((r) => {
      const serviceDate = new Date(r.service_date);
      return (
        serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear
      );
    }).length;

    return {
      total: filteredRecords.length,
      pending,
      inProgress,
      completed,
      totalRevenue,
      thisMonth,
    };
  }, [filteredRecords]);

  // Durum badge'i
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'pending': { color: 'yellow', text: 'Beklemede' },
      'Beklemede': { color: 'yellow', text: 'Beklemede' },
      'confirmed': { color: 'blue', text: 'Onaylandı' },
      'in-progress': { color: 'orange', text: 'İşlemde' },
      'İşlemde': { color: 'orange', text: 'İşlemde' },
      'completed': { color: 'green', text: 'Tamamlandı' },
      'Tamamlandı': { color: 'green', text: 'Tamamlandı' },
      'cancelled': { color: 'red', text: 'İptal Edildi' },
      'İptal Edildi': { color: 'red', text: 'İptal Edildi' },
    };
    const statusInfo = statusMap[status] || { color: 'gray', text: status };
    return <Badge colorScheme={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  // Servis tipi gösterimi
  const getServiceTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'periodic': 'Periyodik Bakım',
      'maintenance': 'Bakım',
      'repair': 'Onarım',
      'inspection': 'Kontrol',
      'cleaning': 'Temizlik',
      'other': 'Diğer',
      'job': 'İş Kaydı',
    };
    return typeMap[type] || type;
  };

  // Filteleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCustomer('');
    setSelectedVehicle('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
  };

  // PDF export işlemi
  const handleExportPDF = async (record: ServiceRecord) => {
    toast({
      title: 'Bilgi',
      description: 'PDF raporu özelliği yakında eklenecek',
      status: 'info',
      duration: 3000,
    });
  };

  const isLoading = isLoadingAppointments;

  return (
    <Box p={5}>
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Servis Geçmişi</Heading>
          <Text fontSize="sm" color="gray.600">
            Tüm servis kayıtları ve randevular
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button leftIcon={<CalendarIcon />} colorScheme="blue" as={RouterLink} to="/appointments">
            Yeni Randevu
          </Button>
          <Button leftIcon={<AddIcon />} colorScheme="green" as={RouterLink} to="/appointments">
            Yeni Servis Kaydı
          </Button>
        </HStack>
      </Flex>

      {/* İstatistikler */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={5} mb={6}>
        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="blue.400"
        >
          <StatLabel>Toplam</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="yellow.400"
        >
          <StatLabel>Beklemede</StatLabel>
          <StatNumber>{stats.pending}</StatNumber>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="orange.400"
        >
          <StatLabel>İşlemde</StatLabel>
          <StatNumber>{stats.inProgress}</StatNumber>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="green.400"
        >
          <StatLabel>Tamamlanan</StatLabel>
          <StatNumber>{stats.completed}</StatNumber>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="teal.400"
        >
          <StatLabel>Bu Ay</StatLabel>
          <StatNumber>{stats.thisMonth}</StatNumber>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="purple.400"
        >
          <StatLabel>Toplam Gelir</StatLabel>
          <StatNumber>{formatCurrency(stats.totalRevenue)}</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Filtreler */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Filtreler</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
            <GridItem>
              <FormControl>
                <FormLabel>Arama</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Müşteri, araç, servis tipi ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Müşteri</FormLabel>
                <Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                  <option value="">Tüm Müşteriler</option>
                  {customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Araç</FormLabel>
                <Select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
                  <option value="">Tüm Araçlar</option>
                  {vehicles?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Durum</FormLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Tüm Durumlar</option>
                  <option value="pending">Beklemede</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="in-progress">İşlemde</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </Select>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Başlangıç Tarihi</FormLabel>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Bitiş Tarihi</FormLabel>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </FormControl>
            </GridItem>
          </Grid>

          <HStack mt={4} spacing={4}>
            <Text fontSize="sm" color="gray.600">
              {filteredRecords.length} sonuç bulundu
            </Text>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Servis Kayıtları Listesi */}
      <Card>
        <CardHeader>
          <Heading size="md">Tüm Kayıtlar</Heading>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : filteredRecords.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Tarih</Th>
                    <Th>Müşteri</Th>
                    <Th>Araç</Th>
                    <Th>Servis Tipi</Th>
                    <Th>Durum</Th>
                    <Th>Notlar</Th>
                    <Th isNumeric>Tutar</Th>
                    <Th>İşlemler</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredRecords.map((record) => (
                    <Tr key={record.id}>
                      <Td>{formatDateDisplaySafe(record.service_date)}</Td>
                      <Td>
                        <Link as={RouterLink} to={`/customers/${record.customer_id}`} color="blue.600">
                          {record.customer?.full_name || 'Bilinmiyor'}
                        </Link>
                      </Td>
                      <Td>
                        {record.vehicle ? (
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {record.vehicle.brand} {record.vehicle.model}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {record.vehicle.plate}
                            </Text>
                          </VStack>
                        ) : (
                          'Bilinmiyor'
                        )}
                      </Td>
                      <Td>{getServiceTypeText(record.service_type)}</Td>
                      <Td>{getStatusBadge(record.status)}</Td>
                      <Td>
                        <Text fontSize="sm" noOfLines={2} maxW="200px">
                          {record.description || record.notes || '-'}
                        </Text>
                      </Td>
                      <Td isNumeric>{formatCurrency(record.cost || 0)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Detay görüntüle"
                            icon={<CalendarIcon />}
                            size="sm"
                            as={RouterLink}
                            to={`/appointments/${record.id}`}
                          />
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              aria-label="Daha fazla işlem"
                              icon={<DownloadIcon />}
                              size="sm"
                              variant="outline"
                            />
                            <MenuList>
                              <MenuItem onClick={() => handleExportPDF(record)}>
                                PDF İndir
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Alert status="info">
              <AlertIcon />
              Seçili kriterlere uygun kayıt bulunamadı.
            </Alert>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default ServiceHistory; 