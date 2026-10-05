import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Text,
    Tooltip,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { AppointmentFormModal } from '../../components/features/AppointmentForm/AppointmentFormModal';
import { useAppointments } from '../../hooks/useAppointments';
import { addMonths, formatDateSafe, formatTime, getMonthEnd, getMonthStart, isPastDateSafe, isSameDay, isTodaySafe, parseDateSafe } from '../../utils/dateUtils';

const AppointmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { appointments, isLoading } = useAppointments({
    startDate: formatDateSafe(getMonthStart(currentDate)),
    endDate: formatDateSafe(getMonthEnd(currentDate)),
  });

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onOpen();
  };

  const previousMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
      case 'Beklemede':
        return 'yellow';
      case 'confirmed':
        return 'blue';
      case 'in-progress':
      case 'İşlemde':
        return 'orange';
      case 'completed':
      case 'Tamamlandı':
        return 'green';
      case 'cancelled':
      case 'İptal Edildi':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Takvim günlerini oluştur
  const generateCalendarDays = () => {
    const startDate = getMonthStart(currentDate);
    const endDate = getMonthEnd(currentDate);
    const days = [];
    
    // Ayın başından önceki günleri ekle
    const startDay = startDate.getDay();
    const firstMonday = new Date(startDate);
    firstMonday.setDate(startDate.getDate() - (startDay === 0 ? 6 : startDay - 1));
    
    for (let i = 0; i < 42; i++) { // 6 hafta x 7 gün
      const day = new Date(firstMonday);
      day.setDate(firstMonday.getDate() + i);
      
      if (day <= endDate || day.getMonth() === currentDate.getMonth()) {
        days.push(day);
      } else {
        days.push(null);
      }
    }
    
    return days;
  };

  // Belirli bir gün için randevuları getir
  const getAppointmentsForDay = (date: Date) => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = parseDateSafe(appointment.appointment_date);
      return isSameDay(appointmentDate, date);
    });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <Box p={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Randevu Takvimi</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Yeni Randevu
        </Button>
      </Flex>

      {/* Takvim Başlığı */}
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <IconButton
          aria-label="Önceki ay"
          icon={<ChevronLeftIcon />}
          onClick={previousMonth}
          variant="ghost"
        />
        <Text fontSize="xl" fontWeight="bold">
          {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </Text>
        <IconButton
          aria-label="Sonraki ay"
          icon={<ChevronRightIcon />}
          onClick={nextMonth}
          variant="ghost"
        />
      </Flex>

      {/* Haftanın günleri */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
        {weekDays.map((day) => (
          <GridItem key={day} p={2} textAlign="center" fontWeight="bold" bg="gray.100">
            {day}
          </GridItem>
        ))}
      </Grid>

      {/* Takvim Günleri */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1} minH="600px">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <GridItem key={index} />;
          }

          const dayAppointments = getAppointmentsForDay(day);
          const isToday = isTodaySafe(day);
          const isPastDate = isPastDateSafe(day);

          return (
            <GridItem
              key={index}
              border="1px"
              borderColor="gray.200"
              p={2}
              minH="120px"
              bg={isToday ? 'blue.50' : isPastDate ? 'gray.50' : 'white'}
              _hover={{ bg: isPastDate ? 'gray.50' : 'gray.50', cursor: isPastDate ? 'default' : 'pointer' }}
              onClick={() => !isPastDate && handleDayClick(day)}
            >
              <VStack align="stretch" spacing={1}>
                <Text
                  fontSize="sm"
                  fontWeight={isToday ? 'bold' : 'normal'}
                  color={isToday ? 'blue.600' : isPastDate ? 'gray.400' : 'gray.700'}
                >
                  {day.getDate()}
                </Text>
                
                {dayAppointments.map((appointment) => (
                  <Tooltip
                    key={appointment.id}
                    label={`${appointment.customer?.full_name} - ${appointment.vehicle?.plate} (${formatTime(appointment.appointment_date)})`}
                    placement="top"
                  >
                    <Badge
                      colorScheme={getStatusColor(appointment.status)}
                      fontSize="xs"
                      p={1}
                      borderRadius="md"
                      cursor="pointer"
                      noOfLines={1}
                    >
                      {formatTime(appointment.appointment_date)}
                    </Badge>
                  </Tooltip>
                ))}

                {/* Uygun slot sayısı göstergesi */}
                {!isPastDate && dayAppointments.length < 10 && (
                  <Text fontSize="xs" color="green.500" textAlign="center">
                    {10 - dayAppointments.length} slot uygun
                  </Text>
                )}
              </VStack>
            </GridItem>
          );
        })}
      </Grid>

      {/* Durum Açıklamaları */}
      <HStack spacing={4} mt={4} justifyContent="center">
        <HStack>
          <Badge colorScheme="yellow">Beklemede</Badge>
          <Badge colorScheme="blue">Onaylandı</Badge>
          <Badge colorScheme="orange">İşlemde</Badge>
          <Badge colorScheme="green">Tamamlandı</Badge>
          <Badge colorScheme="red">İptal</Badge>
        </HStack>
      </HStack>

      {isLoading && (
        <Text textAlign="center" mt={4}>
          Randevular yükleniyor...
        </Text>
      )}

      {/* Randevu Form Modal */}
      <AppointmentFormModal
        isOpen={isOpen}
        onClose={onClose}
        initialDate={selectedDate?.toISOString().split('T')[0]}
      />
    </Box>
  );
};

export default AppointmentCalendar; 