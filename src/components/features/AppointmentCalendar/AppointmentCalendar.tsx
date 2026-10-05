import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Appointment } from '../../../types/appointment';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  appointments: Appointment[];
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onTechnicianAssign?: (appointment: Appointment) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect,
  onAppointmentClick,
  onTechnicianAssign,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const todayBgColor = useColorModeValue('blue.50', 'blue.900');
  const appointmentBgColor = useColorModeValue('blue.100', 'blue.800');

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    // Önceki ayın son günlerini ekle
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        appointments: filterAppointmentsByDate(appointments, prevDate),
      });
    }

    // Mevcut ayın günlerini ekle
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        appointments: filterAppointmentsByDate(appointments, currentDate),
      });
    }

    // Sonraki ayın ilk günlerini ekle
    const remainingDays = 42 - days.length; // 6 satır x 7 gün
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        appointments: filterAppointmentsByDate(appointments, nextDate),
      });
    }

    return days;
  };

  const filterAppointmentsByDate = (appointments: Appointment[], date: Date): Appointment[] => {
    return appointments.filter(
      (appointment) =>
        new Date(appointment.appointment_date).toDateString() === date.toDateString()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = getDaysInMonth(currentDate);

  const getAppointmentStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'in-progress':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    if (!appointments) return [];
    return appointments.filter(
      (appointment) =>
        new Date(appointment.appointment_date).toDateString() === date.toDateString()
    );
  };

  return (
    <Box bg={bgColor} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">
          {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </Heading>
        <ButtonGroup size="sm">
          <Button onClick={handlePrevMonth}>&lt;</Button>
          <Button onClick={handleToday}>Bugün</Button>
          <Button onClick={handleNextMonth}>&gt;</Button>
        </ButtonGroup>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <Box
            key={day}
            p={2}
            textAlign="center"
            fontWeight="bold"
            color="gray.500"
          >
            {day}
          </Box>
        ))}
      </Grid>

      <SimpleGrid columns={7} spacing={1} mt={4}>
        {calendarDays.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <Box
              key={index}
              height="120px"
              p={2}
              borderWidth="1px"
              borderColor={isToday ? 'blue.500' : 'gray.200'}
              bg={isToday ? 'blue.50' : 'white'}
              overflow="auto"
              position="relative"
              cursor={day.date.getMonth() === currentDate.getMonth() ? 'pointer' : 'default'}
              opacity={day.date.getMonth() === currentDate.getMonth() ? 1 : 0.5}
              onClick={() => day.date.getMonth() === currentDate.getMonth() && onDateSelect?.(day.date)}
            >
              <Text
                fontWeight={isToday ? 'bold' : 'normal'}
                color={isToday ? 'blue.500' : 'gray.700'}
              >
                {day.date.getDate()}
              </Text>
              
              {getAppointmentsForDate(day.date).map((appointment) => (
                <Box
                  key={appointment.id}
                  bg={getAppointmentStatusColor(appointment.status)}
                  borderRadius="md"
                  mb={1}
                  p={1}
                  fontSize="xs"
                  color="white"
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick?.(appointment);
                  }}
                >
                  <Tooltip
                    label={`
                      ${appointment.customer?.name}
                      Servis: ${appointment.service_type}
                      Durum: ${appointment.status}
                    `}
                    placement="top"
                  >
                    <Flex justify="space-between" align="center">
                      <Text isTruncated maxW="70%">
                        {new Date(appointment.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {appointment.customer?.name}
                      </Text>
                      <Badge 
                        colorScheme={getAppointmentStatusColor(appointment.status)}
                        fontSize="2xs"
                      >
                        {appointment.status.charAt(0).toUpperCase()}
                      </Badge>
                    </Flex>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}; 