import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import { useSystemSettings } from '../../../hooks/useSettings';
import { Appointment } from '../../../types/appointment';
import { formatDateDisplaySafe, formatTimeDisplaySafe, parseAppointmentDateTime } from '../../../utils/dateUtils';
import { AppointmentForm } from './AppointmentForm';

const getStatusColor = (status: Appointment['status']): string => {
  const colors: Record<Appointment['status'], string> = {
    pending: 'yellow',
    confirmed: 'blue',
    'in-progress': 'orange',
    completed: 'green',
    cancelled: 'red',
    'Beklemede': 'yellow',
    'İşlemde': 'orange',
    'Tamamlandı': 'green',
    'Teslim Edildi': 'green',
    'Teslim Edilmedi': 'red',
    'İptal Edildi': 'red',
  };
  return colors[status];
};

const getStatusText = (status: Appointment['status']): string => {
  const texts: Record<Appointment['status'], string> = {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    'in-progress': 'İşlemde',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    'Beklemede': 'Beklemede',
    'İşlemde': 'İşlemde',
    'Tamamlandı': 'Tamamlandı',
    'Teslim Edildi': 'Teslim Edildi',
    'Teslim Edilmedi': 'Teslim Edilmedi',
    'İptal Edildi': 'İptal Edildi',
  };
  return texts[status];
};

const getServiceTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    periodic: 'Periyodik Bakım',
    repair: 'Onarım',
    inspection: 'Kontrol',
    other: 'Diğer',
  };
  
  return typeMap[type] || type;
};

export const AppointmentList: React.FC = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{
    id: string;
  } | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();
  
  const cancelRef = useRef<HTMLButtonElement>(null);

  const {
    appointments,
    isLoading,
    deleteAppointment,
    isDeleting,
  } = useAppointments();

  const { data: systemSettings } = useSystemSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = systemSettings?.records_per_page || 25;

  const totalAppointments = appointments?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalAppointments / recordsPerPage));

  const pagedAppointments = React.useMemo(() => {
    if (!appointments) return [];
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return appointments.slice(start, end);
  }, [appointments, currentPage, recordsPerPage]);

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete({
      id: appointment.id,
    });
    onDeleteDialogOpen();
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await deleteAppointment(appointmentToDelete.id);
    } finally {
      onDeleteDialogClose();
      setAppointmentToDelete(null);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };

  const handleAdd = () => {
    setSelectedAppointment(null);
    onOpen();
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl" fontWeight="bold">Randevular</Text>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAdd}
        >
          Yeni Randevu
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Tarih</Th>
              <Th>Saat</Th>
              <Th>Müşteri</Th>
              <Th>Araç</Th>
              <Th>Servis Tipi</Th>
              <Th>Durum</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pagedAppointments.map((appointment: Appointment) => (
              <Tr key={appointment.id}>
                <Td>{formatDateDisplaySafe(appointment.appointment_date)}</Td>
                <Td>{formatTimeDisplaySafe(appointment.appointment_date)}</Td>
                <Td>{appointment.customer?.full_name || '-'}</Td>
                <Td>{appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} (${appointment.vehicle.plate})` : '-'}</Td>
                <Td>{getServiceTypeText(appointment.service_type)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </Td>
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
                    onClick={() => handleDelete(appointment)}
                    isLoading={isDeleting}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Sayfalama bilgisi */}
      <Flex mt={4} justify="space-between" align="center" flexWrap="wrap" gap={2}>
        <Text fontSize="sm" color="gray.600">
          Gösterilen{' '}
          {totalAppointments === 0
            ? '0'
            : `${(currentPage - 1) * recordsPerPage + 1} - ${Math.min(
                currentPage * recordsPerPage,
                totalAppointments
              )}`}{' '}
          / Toplam {totalAppointments} randevu
        </Text>
        <Flex gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            isDisabled={currentPage === 1}
          >
            Önceki
          </Button>
          <Text fontSize="sm" alignSelf="center">
            Sayfa {currentPage} / {totalPages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            isDisabled={currentPage === totalPages || totalAppointments === 0}
          >
            Sonraki
          </Button>
        </Flex>
      </Flex>

      {isOpen && (
        <AppointmentForm
          isOpen={isOpen}
          onClose={onClose}
          initialData={selectedAppointment ? 
            {
              customerId: selectedAppointment.customer_id,
              vehicleId: selectedAppointment.vehicle_id,
              date: parseAppointmentDateTime(selectedAppointment.appointment_date).date,
              timeSlot: {
                start: parseAppointmentDateTime(selectedAppointment.appointment_date).startTime,
                end: parseAppointmentDateTime(selectedAppointment.appointment_date).endTime
              },
              serviceType: selectedAppointment.service_type as any,
              services: [],
              notes: selectedAppointment.notes
            } : 
            undefined
          }
          onSubmit={onClose}
          isSubmitting={false}
        />
      )}

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Randevu Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                İptal
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDelete} 
                ml={3}
                isLoading={isDeleting}
              >
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}; 