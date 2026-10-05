import {
    Badge,
    Button,
    FormControl,
    FormLabel,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAppointmentTechnician } from '../../../hooks/useAppointmentTechnician';
import { useTechnicians } from '../../../hooks/useTechnicians';
import { Appointment } from '../../../types/appointment';

interface TechnicianAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

export const TechnicianAssignmentModal: React.FC<TechnicianAssignmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  // Teknisyen ID'si notes alanında "technician_id:123" şeklinde saklanabilir
  // Bu teknisyen ID'sini çıkarmak için basit bir yardımcı fonksiyon
  const getTechnicianIdFromNotes = (notes?: string): string => {
    if (!notes) return '';
    const match = notes.match(/technician_id:(\w+)/);
    return match ? match[1] : '';
  };

  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(
    getTechnicianIdFromNotes(appointment.notes) || ''
  );
  
  const { technicians, isLoading: isLoadingTechnicians } = useTechnicians();
  const { assignTechnician, isAssigning } = useAppointmentTechnician();
  const toast = useToast();

  const handleAssign = async () => {
    if (!selectedTechnicianId) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir teknisyen seçin',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      // Notes alanını kullanarak teknisyen ID'sini saklayalım
      const notes = appointment.notes || '';
      const updatedNotes = notes.includes('technician_id:') 
        ? notes.replace(/technician_id:\w+/, `technician_id:${selectedTechnicianId}`)
        : `${notes}\ntechnician_id:${selectedTechnicianId}`;
      
      await assignTechnician({
        appointmentId: appointment.id,
        technicianId: selectedTechnicianId,
        notes: updatedNotes
      });
      onClose();
    } catch (error) {
      // Hata işleme useAppointmentTechnician hookunda yapılıyor
      console.error("Teknisyen atama hatası:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Teknisyen Ata</ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              <strong>Müşteri:</strong> {appointment.customer?.full_name || appointment.customer?.name || 'Belirtilmemiş'}
            </Text>
            <Text>
              <strong>Servis Tipi:</strong> {getServiceTypeText(appointment.service_type)}
            </Text>
            <Text>
              <strong>Tarih:</strong>{' '}
              {new Date(appointment.appointment_date).toLocaleDateString('tr-TR')}
            </Text>
            <Text>
              <strong>Saat:</strong> {new Date(appointment.appointment_date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
            </Text>
            <Badge colorScheme={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>

            <FormControl>
              <FormLabel>Teknisyen Seç</FormLabel>
              <Select
                placeholder="Teknisyen seçin"
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                isDisabled={isLoadingTechnicians || isAssigning}
              >
                {technicians?.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} - {getTechnicianSpecialtyText(technician.specialization?.[0] || 'general')}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            İptal
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleAssign}
            isLoading={isAssigning}
            isDisabled={isLoadingTechnicians || !selectedTechnicianId}
          >
            Ata
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'yellow';
    case 'in-progress':
      return 'blue';
    case 'completed':
      return 'green';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Planlandı';
    case 'confirmed':
      return 'Onaylandı';
    case 'in-progress':
      return 'Devam Ediyor';
    case 'completed':
      return 'Tamamlandı';
    case 'cancelled':
      return 'İptal Edildi';
    default:
      return 'Bilinmiyor';
  }
};

const getTechnicianSpecialtyText = (specialty: string): string => {
  switch (specialty) {
    case 'general':
      return 'Genel Servis';
    case 'engine':
      return 'Motor';
    case 'electrical':
      return 'Elektrik';
    case 'body':
      return 'Kaporta';
    default:
      return specialty;
  }
};

const getServiceTypeText = (serviceType: string): string => {
  switch (serviceType) {
    case 'periodic':
      return 'Periyodik Bakım';
    case 'repair':
      return 'Onarım';
    case 'inspection':
      return 'Kontrol/Muayene';
    case 'other':
      return 'Diğer';
    default:
      return serviceType;
  }
}; 