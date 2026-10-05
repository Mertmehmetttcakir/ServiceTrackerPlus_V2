import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
    Text,
    Textarea,
    useToast,
    VStack,
    Wrap,
    WrapItem
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppointmentConflictCheck, useAppointments, useAvailableTimeSlots } from '../../../hooks/useAppointments';
import { useCustomers } from '../../../hooks/useCustomers';
import { AppointmentService } from '../../../services/appointmentService';
import { VehicleService } from '../../../services/vehicleService';
import { AppointmentFormData, AppointmentStatus, ServiceType } from '../../../types/appointment';
import { Vehicle } from '../../../types/vehicle';
import { combineDateTime, formatDateForInputSafe, formatDateSafe, getTodaySafe, parseAppointmentDateTime } from '../../../utils/dateUtils';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string | null;
  initialDate?: string;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  initialDate,
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    customerId: '',
    vehicleId: '',
    date: initialDate || formatDateForInputSafe(getTodaySafe()),
    timeSlot: { start: '09:00', end: '10:00' }, // Bu sadece tip uyumluluğu için
    serviceType: 'periodic' as ServiceType,
    services: [],
    notes: '',
    status: 'pending' as AppointmentStatus,
  });

  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(false);
  
  // Düzenleme modunda orijinal randevu saatini sakla
  const [originalTimeSlot, setOriginalTimeSlot] = useState<{ start: string; end: string } | null>(null);

  const { customers } = useCustomers({ sortBy: 'full_name', sortOrder: 'asc' });
  const { createAppointment, updateAppointment, isCreating, isUpdating, appointments } = useAppointments();
  
  // Sadece tarih değiştiğinde uygun saatleri yeniden yükle
  const memoizedDate = useMemo(() => formData.date, [formData.date]);
  const { 
    availableSlots, 
    busySlots, 
    isLoadingSlots 
  } = useAvailableTimeSlots(memoizedDate, 60);
  
  const { checkConflict, isChecking, conflictResult } = useAppointmentConflictCheck();
  const toast = useToast();

  // Randevu yüklenme durumunu takip etmek için ref
  const isLoadingAppointmentRef = useRef(false);
  const loadedAppointmentIdRef = useRef<string | null>(null);

  // Düzenleme modunda appointment verilerini yükle
  useEffect(() => {
    const loadAppointmentData = async () => {
      if (appointmentId && appointmentId !== loadedAppointmentIdRef.current) {
        isLoadingAppointmentRef.current = true;
        loadedAppointmentIdRef.current = appointmentId;
        setIsLoadingAppointment(true);
        try {
          // Önce mevcut appointments listesinden kontrol et
          let appointment = appointments?.find(apt => apt.id === appointmentId);
          
          // Eğer listede yoksa API'den getir
          if (!appointment) {
            appointment = await AppointmentService.getAppointmentById(appointmentId);
          }

          if (appointment) {
            const { date, startTime, endTime } = parseAppointmentDateTime(appointment.appointment_date);
            const timeSlot = { start: startTime, end: endTime };

            setFormData({
              customerId: appointment.customer_id,
              vehicleId: appointment.vehicle_id,
              date: date,
              timeSlot: { start: '09:00', end: '10:00' }, // Dummy değer, kullanılmayacak
              serviceType: appointment.service_type as ServiceType,
              services: [],
              notes: appointment.notes || '',
              status: appointment.status as AppointmentStatus,
            });

            // Düzenleme modunda mevcut saati koru
            setSelectedTimeSlot(timeSlot);
            setOriginalTimeSlot(timeSlot);
          }
        } catch (error) {
          console.error('Randevu verileri yüklenemedi:', error);
          toast({
            title: 'Hata',
            description: 'Randevu verileri yüklenirken bir hata oluştu',
            status: 'error',
            duration: 3000,
          });
        } finally {
          setIsLoadingAppointment(false);
          isLoadingAppointmentRef.current = false;
        }
      } else if (!appointmentId && loadedAppointmentIdRef.current !== null) {
        // Yeni randevu için formu sıfırla (sadece appointmentId null olduğunda)
        loadedAppointmentIdRef.current = null;
        resetForm();
      }
    };

    if (isOpen) {
      loadAppointmentData();
    }
  }, [appointmentId, isOpen]); // toast bağımlılığını kaldırdım

  // Müşteri değiştiğinde araçları getir
  useEffect(() => {
    if (formData.customerId) {
      const fetchVehicles = async () => {
        try {
          const vehicleList = await VehicleService.getVehiclesByCustomerId(formData.customerId);
          setCustomerVehicles(vehicleList);
        } catch (error) {
          console.error('Araçlar getirilemedi:', error);
        }
      };
      fetchVehicles();
    } else {
      setCustomerVehicles([]);
      setFormData(prev => ({ ...prev, vehicleId: '' }));
    }
  }, [formData.customerId]);

  // Saat seçildiğinde çakışma kontrolü yap (debounced)
  useEffect(() => {
    // Randevu yüklenirken çakışma kontrolü yapma
    if (isLoadingAppointmentRef.current) return;
    
    if (formData.date && selectedTimeSlot?.start && selectedTimeSlot?.end) {
      const timeoutId = setTimeout(() => {
        checkConflict({
          appointmentDate: formData.date,
          startTime: selectedTimeSlot.start,
          endTime: selectedTimeSlot.end,
          excludeAppointmentId: appointmentId || undefined,
        });
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [formData.date, selectedTimeSlot?.start, selectedTimeSlot?.end, appointmentId, checkConflict]);

  // Çakışma sonucunu kontrol et
  useEffect(() => {
    if (conflictResult) {
      setShowConflictWarning(conflictResult.hasConflict);
    }
  }, [conflictResult]);

  const handleSubmit = async () => {
    try {
      // Form validasyonu
      if (!formData.customerId || !formData.vehicleId || !formData.date) {
        toast({
          title: 'Eksik Bilgi',
          description: 'Lütfen tüm zorunlu alanları doldurun',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      // Saat seçimi kontrolü
      if (!selectedTimeSlot) {
        toast({
          title: 'Saat Seçimi Gerekli',
          description: 'Lütfen uygun saatlerden birini seçin',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      // Çakışma kontrolü
      if (showConflictWarning) {
        toast({
          title: 'Randevu Çakışması',
          description: 'Bu saatte zaten bir randevu mevcut. Lütfen farklı bir saat seçin.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      // Tarih ve saat bilgisini UTC formatında birleştir
      const appointmentDateTime = combineDateTime(formData.date, selectedTimeSlot.start);

      const appointmentData = {
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        appointment_date: appointmentDateTime,
        service_type: formData.serviceType,
        notes: formData.notes || '',
        status: formData.status || 'pending',
      };

      if (appointmentId) {
        await updateAppointment({ id: appointmentId, data: appointmentData });
      } else {
        await createAppointment(appointmentData);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Randevu kaydedilemedi:', error);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: any) => {
    // Sadece kullanıcı manuel olarak tarih değiştirdiğinde selectedTimeSlot'u temizle
    // Randevu yüklenirken bu işlemi yapma
    if (field === 'date' && value !== formData.date && !isLoadingAppointmentRef.current) {
      setSelectedTimeSlot(null);
      setOriginalTimeSlot(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTimeSlotSelect = (slot: { start: string; end: string }) => {
    setSelectedTimeSlot(slot);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      vehicleId: '',
      date: initialDate || formatDateForInputSafe(getTodaySafe()),
      timeSlot: { start: '09:00', end: '10:00' }, // Dummy değer
      serviceType: 'periodic' as ServiceType,
      services: [],
      notes: '',
      status: 'pending' as AppointmentStatus,
    });
    setCustomerVehicles([]);
    setSelectedTimeSlot(null);
    setOriginalTimeSlot(null);
    setShowConflictWarning(false);
    
    // Ref'leri de sıfırla
    isLoadingAppointmentRef.current = false;
    loadedAppointmentIdRef.current = null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {appointmentId ? 'Randevu Düzenle' : 'Yeni Randevu Oluştur'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {isLoadingAppointment ? (
            <VStack py={8}>
              <Spinner size="lg" />
              <Text>Randevu verileri yükleniyor...</Text>
            </VStack>
          ) : (
            <VStack spacing={4}>
              {/* Çakışma Uyarısı */}
              {showConflictWarning && conflictResult?.conflictingAppointments && (
                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Randevu Çakışması!</Text>
                    <Text fontSize="sm">
                      Bu saatte zaten randevu var: {' '}
                      {conflictResult.conflictingAppointments.map(apt => 
                        `${apt.customer?.full_name} (${parseAppointmentDateTime(apt.appointment_date).startTime})`
                      ).join(', ')}
                    </Text>
                  </Box>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Müşteri</FormLabel>
                <Select
                  placeholder="Müşteri seçin"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                >
                  {customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} - {customer.phone}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Araç</FormLabel>
                <Select
                  placeholder="Araç seçin"
                  value={formData.vehicleId}
                  onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                  isDisabled={!formData.customerId}
                >
                  {customerVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tarih</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={formatDateSafe(getTodaySafe())}
                />
              </FormControl>

              {/* Uygun Saat Dilimleri */}
              {formData.date && (
                <FormControl isRequired>
                  <FormLabel>Saat Seçimi</FormLabel>
                  {isLoadingSlots ? (
                    <HStack justify="center" py={4}>
                      <Spinner size="sm" />
                      <Text>Uygun saatler yükleniyor...</Text>
                    </HStack>
                  ) : (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        {appointmentId ? 'Mevcut saat veya uygun saatlerden birini seçin:' : 'Uygun saatlerden birini seçin:'}
                      </Text>
                      <Wrap spacing={2} mb={4}>
                        {/* Düzenleme modunda mevcut randevunun saatini göster */}
                        {appointmentId && originalTimeSlot && (
                          <WrapItem>
                            <Badge
                              as="button"
                              colorScheme={selectedTimeSlot?.start === originalTimeSlot.start ? "blue" : "gray"}
                              variant="solid"
                              p={2}
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => handleTimeSlotSelect(originalTimeSlot)}
                              border="2px solid"
                              borderColor={selectedTimeSlot?.start === originalTimeSlot.start ? "blue.400" : "gray.400"}
                            >
                              {originalTimeSlot.start} - {originalTimeSlot.end}
                              <Text fontSize="xs" ml={1}>
                                (Mevcut)
                              </Text>
                            </Badge>
                          </WrapItem>
                        )}
                        
                        {/* Diğer uygun saatler */}
                        {availableSlots.map((slot, index) => {
                          // Düzenleme modunda mevcut saati tekrar gösterme
                          if (appointmentId && originalTimeSlot && 
                              slot.start === originalTimeSlot.start && 
                              slot.end === originalTimeSlot.end) {
                            return null;
                          }
                          
                          return (
                            <WrapItem key={index}>
                              <Badge
                                as="button"
                                colorScheme={
                                  selectedTimeSlot?.start === slot.start ? 'blue' : 'green'
                                }
                                variant={
                                  selectedTimeSlot?.start === slot.start ? 'solid' : 'outline'
                                }
                                p={2}
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => handleTimeSlotSelect(slot)}
                                _hover={{ transform: 'scale(1.05)' }}
                              >
                                {slot.start} - {slot.end}
                              </Badge>
                            </WrapItem>
                          );
                        })}
                      </Wrap>
                      
                      {selectedTimeSlot && (
                        <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                          Seçilen saat: {selectedTimeSlot.start} - {selectedTimeSlot.end}
                        </Text>
                      )}
                      
                      {availableSlots.length === 0 && !appointmentId && (
                        <Alert status="warning">
                          <AlertIcon />
                          Bu tarihte uygun saat dilimi bulunmuyor.
                        </Alert>
                      )}
                    </Box>
                  )}
                </FormControl>
              )}

              {/* Dolu Saatler */}
              {busySlots.length > 0 && (
                <FormControl>
                  <FormLabel>Dolu Saatler</FormLabel>
                  <Wrap spacing={2}>
                    {busySlots.map((slot, index) => (
                      <WrapItem key={index}>
                        <Badge
                          colorScheme="red"
                          variant="solid"
                          p={2}
                          borderRadius="md"
                        >
                          {slot.start} - {slot.end}
                          <Text fontSize="xs">
                            ({slot.appointment.customer?.full_name})
                          </Text>
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>
              )}

              <HStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Servis Tipi</FormLabel>
                  <Select
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange('serviceType', e.target.value as ServiceType)}
                  >
                    <option value="periodic">Periyodik Bakım</option>
                    <option value="repair">Arıza Tamiri</option>
                    <option value="inspection">Muayene</option>
                    <option value="other">Diğer</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Durum</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as AppointmentStatus)}
                  >
                    <option value="pending">Beklemede</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="in-progress">İşlemde</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Notlar</FormLabel>
                <Textarea
                  placeholder="Randevu ile ilgili notlar..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            İptal
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isCreating || isUpdating || isChecking || isLoadingAppointment}
            isDisabled={showConflictWarning || !selectedTimeSlot}
          >
            {appointmentId ? 'Güncelle' : 'Oluştur'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 