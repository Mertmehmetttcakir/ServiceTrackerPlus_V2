import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Progress,
  SimpleGrid,
  Spinner,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useToast,
} from '@chakra-ui/react';
import React from 'react';
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTruck,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { useCustomers } from '../hooks/useCustomers';
import { useMonthlyRevenue } from '../hooks/useDashboard';
import { useSystemSettings } from '../hooks/useSettings';
import { useVehicles } from '../hooks/useVehicles';
import { AppointmentFilters } from '../types/appointment';
import { formatTimeDisplaySafe } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Bugünkü tarih
  const today = new Date().toISOString().split('T')[0];

  // Bugünkü randevular için filter
  const todayAppointmentFilters: AppointmentFilters = {
    startDate: today,
    endDate: today,
  };
  
  const { appointments: todayAppointments, isLoading: isLoadingAppointments } = useAppointments(todayAppointmentFilters);
  const { appointments: allAppointments } = useAppointments();
  const { customers, isLoading: isLoadingCustomers } = useCustomers({
    sortBy: 'full_name',
    sortOrder: 'asc'
  });
  const { vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { data: systemSettings } = useSystemSettings();
  
  // Optimize edilmiş aylık gelir verileri
  const { 
    data: monthlyRevenue, 
    isLoading: isLoadingMonthlyRevenue, 
    error: monthlyRevenueError 
  } = useMonthlyRevenue();

  const monthlyAppointmentTarget = systemSettings?.monthly_appointment_target ?? 150;
  const monthlyRevenueTarget = systemSettings?.monthly_revenue_target ?? 50000;

  // Randevu durumlarını hesapla
  const appointmentStats = {
    today: todayAppointments?.length || 0,
    completed: todayAppointments?.filter(apt => apt.status === 'completed' || apt.status === 'Tamamlandı').length || 0,
    pending: todayAppointments?.filter(apt => apt.status === 'pending' || apt.status === 'Beklemede').length || 0,
    inProgress: todayAppointments?.filter(apt => apt.status === 'in-progress' || apt.status === 'İşlemde').length || 0,
    totalThisMonth: allAppointments?.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const now = new Date();
      return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
    }).length || 0,
  };

  // Randevu durumu renkleri
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'pending': 'yellow',
      'Beklemede': 'yellow',
      'confirmed': 'blue',
      'in-progress': 'orange',
      'İşlemde': 'orange', 
      'completed': 'green',
      'Tamamlandı': 'green',
      'cancelled': 'red',
      'İptal Edildi': 'red',
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      'pending': 'Bekliyor',
      'Beklemede': 'Bekliyor',
      'confirmed': 'Onaylandı',
      'in-progress': 'İşlemde',
      'İşlemde': 'İşlemde',
      'completed': 'Tamamlandı',
      'Tamamlandı': 'Tamamlandı',
      'cancelled': 'İptal',
      'İptal Edildi': 'İptal',
    };
    return texts[status] || status;
  };

  return (
    <Box p={5}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Heading size="lg">
          Hoş Geldiniz,{' '}
          {user?.name ||
            // Supabase kullanıcısının e-posta adresini yedek isim olarak kullan
            (user?.email ? user.email.split('@')[0] : 'Kullanıcı')}
        </Heading>
        <Text color="gray.500">Bugün: {new Date().toLocaleDateString('tr-TR')}</Text>
      </Flex>

      {/* Ana Metrikler */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Stat
          px={4}
          py={3}
          bg="white"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="blue.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Toplam Müşteri</StatLabel>
              <StatNumber>{isLoadingCustomers ? <Spinner size="sm" /> : customers?.length || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Bu ay +{Math.floor((customers?.length || 0) * 0.1)}
              </StatHelpText>
            </Box>
            <Box my="auto" color="blue.400" alignContent="center">
              <Icon as={FiUsers} w={6} h={6} />
            </Box>
          </Flex>
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
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Bugünkü Randevu</StatLabel>
              <StatNumber>{isLoadingAppointments ? <Spinner size="sm" /> : appointmentStats.today}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Bu ay {appointmentStats.totalThisMonth} toplam
              </StatHelpText>
            </Box>
            <Box my="auto" color="green.400" alignContent="center">
              <Icon as={FiCalendar} w={6} h={6} />
            </Box>
          </Flex>
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
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Kayıtlı Araç</StatLabel>
              <StatNumber>{isLoadingVehicles ? <Spinner size="sm" /> : vehicles?.length || 0}</StatNumber>
              <StatHelpText>
                <Icon as={FiTruck} mr={1} />
                Aktif araçlar
              </StatHelpText>
            </Box>
            <Box my="auto" color="purple.400" alignContent="center">
              <Icon as={FiTruck} w={6} h={6} />
            </Box>
          </Flex>
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
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel color="gray.500">Aylık Gelir</StatLabel>
              <StatNumber>
                {isLoadingMonthlyRevenue ? (
                  <Flex align="center" gap={2}>
                    <Spinner size="sm" color="orange.400" />
                    <Text fontSize="lg" color="gray.400">Hesaplanıyor...</Text>
                  </Flex>
                ) : monthlyRevenueError ? (
                  <Text color="red.500" fontSize="sm">Hata</Text>
                ) : monthlyRevenue ? (
                  formatCurrency(monthlyRevenue.totalRevenue)
                ) : (
                  formatCurrency(0)
                )}
              </StatNumber>
              <StatHelpText>
                {isLoadingMonthlyRevenue ? (
                  <Text fontSize="xs" color="gray.400">Son veriler alınıyor...</Text>
                ) : monthlyRevenueError ? (
                  <Text color="red.500" fontSize="xs">Veri alınamadı</Text>
                ) : monthlyRevenue ? (
                  <>
                    <StatArrow type={monthlyRevenue.revenueGrowth > 0 ? "increase" : "decrease"} />
                    %{monthlyRevenue.revenueGrowth.toFixed(1)} (önceki aya göre)
                  </>
                ) : (
                  <Text fontSize="xs">Veri yok</Text>
                )}
              </StatHelpText>
            </Box>
            <Box my="auto" color="orange.400" alignContent="center">
              <Icon as={FiDollarSign} w={6} h={6} />
            </Box>
          </Flex>
        </Stat>
      </SimpleGrid>

      {/* Randevu Özeti */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={8}>
        <Stat
          px={4}
          py={3}
          bg="green.50"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="green.400"
        >
          <Flex justifyContent="space-between" align="center">
            <Box>
              <StatLabel color="green.600">Tamamlanan</StatLabel>
              <StatNumber color="green.700">{appointmentStats.completed}</StatNumber>
            </Box>
            <Icon as={FiCheckCircle} color="green.500" w={5} h={5} />
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="orange.50"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="orange.400"
        >
          <Flex justifyContent="space-between" align="center">
            <Box>
              <StatLabel color="orange.600">İşlemde</StatLabel>
              <StatNumber color="orange.700">{appointmentStats.inProgress}</StatNumber>
            </Box>
            <Icon as={FiClock} color="orange.500" w={5} h={5} />
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={3}
          bg="yellow.50"
          shadow="sm"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="yellow.400"
        >
          <Flex justifyContent="space-between" align="center">
            <Box>
              <StatLabel color="yellow.600">Bekleyen</StatLabel>
              <StatNumber color="yellow.700">{appointmentStats.pending}</StatNumber>
            </Box>
            <Icon as={FiAlertCircle} color="yellow.500" w={5} h={5} />
          </Flex>
        </Stat>
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={5}>
        <GridItem>
          <Card shadow="sm">
            <CardHeader pb={1}>
              <Flex justify="space-between" align="center">
                <Heading size="md">Bugünkü Randevular</Heading>
                <Badge colorScheme="blue" variant="subtle">
                  {appointmentStats.today} randevu
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              {isLoadingAppointments ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : todayAppointments && todayAppointments.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {todayAppointments.slice(0, 6).map((appointment) => (
                    <Box 
                      key={appointment.id} 
                      borderWidth="1px" 
                      borderRadius="lg" 
                      p={3}
                      bg="white"
                      shadow="sm"
                    >
                      <Flex justifyContent="space-between" alignItems="center" mb={2}>
                        <Text fontWeight="bold" fontSize="sm">
                          {formatTimeDisplaySafe(appointment.appointment_date)} - {appointment.customer?.full_name || 'Müşteri'}
                        </Text>
                        <Badge 
                          colorScheme={getStatusColor(appointment.status)}
                          variant="subtle"
                          fontSize="xs"
                        >
                          {getStatusText(appointment.status)}
                        </Badge>
                      </Flex>
                      <Text color="gray.600" fontSize="sm" mb={1}>
                        {appointment.service_type === 'periodic' ? 'Periyodik Bakım' : 
                         appointment.service_type === 'repair' ? 'Onarım' :
                         appointment.service_type === 'inspection' ? 'Kontrol' : 'Diğer'}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} (${appointment.vehicle.plate})` : 'Araç bilgisi yok'}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  Bugün için planlanmış randevu bulunmuyor.
                </Alert>
              )}
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card shadow="sm" h="100%">
            <CardHeader pb={1}>
              <Heading size="md">Servis Durumu</Heading>
            </CardHeader>
            <CardBody>
              <Box mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Bugün Tamamlanan</Text>
                  <Text fontSize="sm" fontWeight="medium" color="green.500">
                    {appointmentStats.completed}/{appointmentStats.today}
                  </Text>
                </Flex>
                <Progress 
                  value={appointmentStats.today > 0 ? (appointmentStats.completed / appointmentStats.today) * 100 : 0} 
                  size="sm" 
                  colorScheme="green" 
                />
              </Box>
              
              <Box mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">İşlemdeki Randevular</Text>
                  <Text fontSize="sm" fontWeight="medium" color="orange.500">
                    {appointmentStats.inProgress}
                  </Text>
                </Flex>
                <Progress 
                  value={appointmentStats.today > 0 ? (appointmentStats.inProgress / appointmentStats.today) * 100 : 0} 
                  size="sm" 
                  colorScheme="orange" 
                />
              </Box>
              
              <Box mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Aylık Hedef</Text>
                  <Text fontSize="sm" fontWeight="medium" color="blue.500">
                    {appointmentStats.totalThisMonth}/{monthlyAppointmentTarget}
                  </Text>
                </Flex>
                <Progress 
                  value={
                    monthlyAppointmentTarget > 0
                      ? (appointmentStats.totalThisMonth / monthlyAppointmentTarget) * 100
                      : 0
                  } 
                  size="sm" 
                  colorScheme="blue" 
                />
              </Box>
              
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Aylık Gelir Hedefi</Text>
                  <Text fontSize="sm" fontWeight="medium" color="purple.500">
                    {monthlyRevenue && monthlyRevenueTarget > 0
                      ? `%${((monthlyRevenue.totalRevenue / monthlyRevenueTarget) * 100).toFixed(0)}`
                      : '0%'}
                  </Text>
                </Flex>
                <Progress 
                  value={
                    monthlyRevenue && monthlyRevenueTarget > 0
                      ? (monthlyRevenue.totalRevenue / monthlyRevenueTarget) * 100
                      : 0
                  } 
                  size="sm" 
                  colorScheme="purple" 
                />
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}; 