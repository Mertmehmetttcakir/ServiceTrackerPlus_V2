import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import { AppointmentFormData, RecurrencePattern } from '../../../types/appointment';
import { RecurrenceOptions } from '../AppointmentForm/RecurrenceOptions';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
  initialData?: Partial<AppointmentFormData>;
  isSubmitting: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [date, setDate] = useState<string>(initialData?.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(
    initialData?.recurrencePattern || { type: 'none' }
  );
  const [isRecurring, setIsRecurring] = useState<boolean>(
    initialData?.recurrencePattern?.type !== 'none' && 
    initialData?.recurrencePattern?.type !== undefined
  );
  
  const { createAppointment, createRecurringAppointments, isCreating, isCreatingRecurring } = useAppointments();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form verilerini topla
    const formElement = e.currentTarget;
    const formData: AppointmentFormData = {
      customerId: formElement.customerId?.value,
      vehicleId: formElement.vehicleId?.value,
      date: formElement.date?.value,
      timeSlot: {
        start: formElement.timeSlotStart?.value,
        end: formElement.timeSlotEnd?.value
      },
      serviceType: formElement.serviceType?.value,
      services: [], // TODO: Hizmet listesini doldur
      technicianId: formElement.technicianId?.value,
      notes: formElement.notes?.value,
      status: formElement.status?.value,
      recurrencePattern: recurrencePattern
    };

    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? 'Randevu Düzenle' : 'Yeni Randevu'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Tarih</FormLabel>
                <Input
                  name="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Servis Tipi</FormLabel>
                <Select
                  name="serviceType"
                  defaultValue={initialData?.serviceType}
                >
                  <option value="periodic">Periyodik Bakım</option>
                  <option value="repair">Onarım</option>
                  <option value="inspection">Kontrol</option>
                  <option value="other">Diğer</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Durum</FormLabel>
                <Select
                  name="status"
                  defaultValue={initialData?.status || 'pending'}
                >
                  <option value="pending">Bekliyor</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="in-progress">İşlemde</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <Checkbox 
                  isChecked={isRecurring}
                  onChange={(e) => {
                    setIsRecurring(e.target.checked);
                    if (!e.target.checked) {
                      setRecurrencePattern({ type: 'none' });
                    }
                  }}
                >
                  Tekrarlayan Randevu
                </Checkbox>
              </FormControl>
              
              {isRecurring && (
                <Accordion allowToggle defaultIndex={[0]}>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Tekrarlama Seçenekleri
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <RecurrenceOptions
                        value={recurrencePattern}
                        onChange={setRecurrencePattern}
                        startDate={date}
                      />
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isRecurring ? isCreatingRecurring : isSubmitting}
            >
              {initialData ? 'Güncelle' : (isRecurring ? 'Tekrarlayan Randevular Oluştur' : 'Oluştur')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 