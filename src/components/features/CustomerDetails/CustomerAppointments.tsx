import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
    Badge,
    Box,
    Button,
    IconButton,
    Spinner,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from '@chakra-ui/react';
import React from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import { Appointment, AppointmentFormData } from '../../../types/appointment';
import { AppointmentForm } from '../AppointmentList/AppointmentForm';

interface CustomerAppointmentsProps {
  customerId: string;
}

const getStatusColor = (status: Appointment['status']): string => {
  const colors: Record<string, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    'in-progress': 'orange',
    completed: 'green',
    cancelled: 'red',
    Beklemede: 'yellow',
    'İşlemde': 'orange',
    'Tamamlandı': 'green',
    'Teslim Edildi': 'green',
    'Teslim Edilmedi': 'red',
    'İptal Edildi': 'red',
  };
  return colors[status] ?? 'gray';
};

const getStatusText = (status: Appointment['status']): string => {
  const texts: Record<string, string> = {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    'in-progress': 'İşlemde',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    Beklemede: 'Beklemede',
    'İşlemde': 'İşlemde',
    'Tamamlandı': 'Tamamlandı',
    'Teslim Edildi': 'Teslim Edildi',
    'Teslim Edilmedi': 'Teslim Edilmedi',
    'İptal Edildi': 'İptal Edildi',
  };
  return texts[status] ?? status;
};

export const CustomerAppointments: React.FC<CustomerAppointmentsProps> = ({ customerId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | undefined>(undefined);
  
  const {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAppointments({
    customerId,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const handleAdd = () => {
    setSelectedAppointment(undefined);
    onOpen();
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      await deleteAppointment(id);
    }
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    if (selectedAppointment) {
      await updateAppointment({
        id: selectedAppointment.id,
        data: {
          ...data,
          customer_id: customerId,
          vehicle_id: data.vehicleId,
          appointment_date: data.date,
          service_type: data.serviceType,
        },
      });
    } else {
      await createAppointment({
        customer_id: customerId,
        vehicle_id: data.vehicleId,
        appointment_date: data.date,
        service_type: data.serviceType,
        status: data.status || 'pending',
        timeSlot: data.timeSlot,
        notes: data.notes,
        recurrencePattern: data.recurrencePattern,
      });
    }
    onClose();
  };

  // Tarih ve zaman dilimi kontrolü
  const renderAppointmentDate = (date?: string) => 
    date ? new Date(date).toLocaleDateString('tr-TR') : '-';

  const renderAppointmentTimeSlot = (timeSlot?: { start: string; end: string }) => 
    timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : '-';

  const renderTotalPrice = (totalPrice?: number) => 
    totalPrice ? totalPrice.toLocaleString('tr-TR') + ' ₺' : '-';

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        leftIcon={<AddIcon />}
        colorScheme="blue"
        mb={4}
        onClick={handleAdd}
      >
        Yeni Randevu
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Tarih</Th>
            <Th>Saat</Th>
            <Th>Servis Tipi</Th>
            <Th>Teknisyen</Th>
            <Th>Durum</Th>
            <Th>Tutar</Th>
            <Th>İşlemler</Th>
          </Tr>
        </Thead>
        <Tbody>
          {appointments?.map((appointment) => (
            <Tr key={appointment.id}>
              <Td>{renderAppointmentDate(appointment.date)}</Td>
              <Td>{renderAppointmentTimeSlot(appointment.timeSlot)}</Td>
              <Td>{appointment.serviceType}</Td>
              <Td>{appointment.technician?.name || '-'}</Td>
              <Td>
                <Badge colorScheme={getStatusColor(appointment.status)}>
                  {getStatusText(appointment.status)}
                </Badge>
              </Td>
              <Td>{renderTotalPrice(appointment.totalPrice)}</Td>
              <Td>
                <IconButton
                  aria-label="Düzenle"
                  icon={<EditIcon />}
                  size="sm"
                  mr={2}
                  onClick={() => handleEdit(appointment)}
                />
                <IconButton
                  aria-label="Sil"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(appointment.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <AppointmentForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialData={selectedAppointment}
        isSubmitting={false}
      />
    </Box>
  );
}; 