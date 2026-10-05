import { AddIcon, CalendarIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentFormModal } from '../../components/features/AppointmentForm/AppointmentFormModal';
import { useAppointments } from '../../hooks/useAppointments';
import { AppointmentStatus } from '../../types/appointment';
import { formatDate, formatTime } from '../../utils/dateUtils';

export const AppointmentsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { appointments, isLoading, deleteAppointment, isDeleting } = useAppointments({
    status: statusFilter || undefined
  });
  const toast = useToast();
  const navigate = useNavigate();

  const handleEdit = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    onOpen();
  };

  const handleDelete = async (appointmentId: string) => {
    if (window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteAppointment(appointmentId);
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Randevu silinirken bir hata oluştu',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedAppointmentId(null);
    onOpen();
  };

  const handleViewCalendar = () => {
    navigate('/appointments/calendar');
  };

  const getStatusColor = (status: AppointmentStatus): string => {
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

  const getStatusText = (status: AppointmentStatus): string => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'in-progress':
        return 'İşlemde';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  // Randevuları filtreleme
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    return appointments.filter(appointment => {
      const matchesSearch = !searchTerm || 
        appointment.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.vehicle?.plate?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const handleCloseModal = () => {
    setSelectedAppointmentId(null);
    onClose();
  };

  return (
    <Box p={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Randevular</Heading>
        <HStack>
          <Button
            leftIcon={<ViewIcon />}
            variant="outline"
            onClick={handleViewCalendar}
          >
            Takvim Görünümü
          </Button>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreateNew}
          >
            Yeni Randevu
          </Button>
        </HStack>
      </Flex>

      {/* Filtreler */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4}>
            <Box flex={1}>
              <InputGroup>
                <InputLeftElement>
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Müşteri adı veya araç plakası ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Box>
            <Select
              placeholder="Durum Filtresi"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus)}
              w="200px"
            >
              <option value="pending">Beklemede</option>
              <option value="confirmed">Onaylandı</option>
              <option value="in-progress">İşlemde</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Randevu Listesi */}
      {isLoading ? (
        <Text>Yükleniyor...</Text>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={10}>
            <CalendarIcon boxSize={12} color="gray.400" mb={4} />
            <Text fontSize="lg" color="gray.500">
              {searchTerm || statusFilter ? 'Filtrelere uygun randevu bulunamadı' : 'Henüz randevu bulunmuyor'}
            </Text>
            <Button mt={4} colorScheme="blue" onClick={handleCreateNew}>
              İlk Randevuyu Oluştur
            </Button>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack>
                    <Badge colorScheme={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                    <Text fontWeight="bold">
                      {formatDate(appointment.appointment_date)} - {formatTime(appointment.appointment_date)}
                    </Text>
                  </HStack>
                  <HStack>
                    <IconButton
                      aria-label="Düzenle"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEdit(appointment.id)}
                    />
                    <IconButton
                      aria-label="Sil"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(appointment.id)}
                      isLoading={isDeleting}
                    />
                  </HStack>
                </Flex>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Text fontWeight="semibold">Müşteri:</Text>
                    <Text>{appointment.customer?.full_name || 'Bilinmiyor'}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="semibold">Telefon:</Text>
                    <Text>{appointment.customer?.phone || '-'}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="semibold">Araç:</Text>
                    <Text>
                      {appointment.vehicle ? 
                        `${appointment.vehicle.brand} ${appointment.vehicle.model} (${appointment.vehicle.plate})` : 
                        'Bilinmiyor'
                      }
                    </Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="semibold">Servis Tipi:</Text>
                    <Text>
                      {appointment.service_type === 'periodic' ? 'Periyodik Bakım' :
                       appointment.service_type === 'repair' ? 'Arıza Tamiri' :
                       appointment.service_type === 'inspection' ? 'Muayene' :
                       appointment.service_type === 'other' ? 'Diğer' : 
                       appointment.service_type}
                    </Text>
                  </HStack>
                  {appointment.notes && (
                    <HStack align="start">
                      <Text fontWeight="semibold">Notlar:</Text>
                      <Text>{appointment.notes}</Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Randevu Form Modal */}
      <AppointmentFormModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        appointmentId={selectedAppointmentId}
      />
    </Box>
  );
}; 