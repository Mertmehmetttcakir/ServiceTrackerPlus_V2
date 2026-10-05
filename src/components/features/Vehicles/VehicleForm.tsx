import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useCreateMultipleFinancialTransactions } from '../../../hooks/useFinancialTransactions';
import { useCreateJob } from '../../../hooks/useJobs';
import { useCreateVehicle, useUpdateVehicle } from '../../../hooks/useVehicles';
import { FinancialTransactionCreate } from '../../../types/financial';
import { JobCreate, Job as JobType } from '../../../types/job';
import { Vehicle, VehicleCreate, VehicleFormData } from '../../../types/vehicle';
import { logger } from '../../../utils/logger';
import { vehicleSchema } from '../../../utils/validation';

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  vehicleToEdit?: Vehicle | null;
  onSuccess?: () => void;
}

// VehicleFormData'dan customer_id'yi çıkardık çünkü o props'tan geliyor.
// Finansal alanları da buraya ekleyebiliriz veya ayrı bir state olarak tutabiliriz.
// Şimdilik ayrı state'lerde tutalım daha net olması için.
const initialVehicleFormData: Omit<VehicleFormData, 'customer_id'> = {
  plate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  notes: '',
};

export const VehicleForm: React.FC<VehicleFormProps> = ({
  isOpen,
  onClose,
  customerId,
  vehicleToEdit,
  onSuccess
}) => {
  const toast = useToast();
  const [vehicleData, setVehicleData] = useState<Omit<VehicleFormData, 'customer_id'>>(initialVehicleFormData);
  const [isOutsideJob, setIsOutsideJob] = useState(false);
  const [outsideJobName, setOutsideJobName] = useState('');

  // Finansal Alanlar için State'ler
  const [initialServiceFee, setInitialServiceFee] = useState<number | undefined>();
  const [initialServiceDescription, setInitialServiceDescription] = useState('');
  const [paymentReceived, setPaymentReceived] = useState<number | undefined>();
  const [paymentDescription, setPaymentDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const { mutateAsync: createVehicle, isPending: isCreatingVehicle } = useCreateVehicle();
  const { mutateAsync: updateVehicle, isPending: isUpdatingVehicle } = useUpdateVehicle();
  const { mutateAsync: createJob, isPending: isCreatingJob } = useCreateJob();
  const { mutateAsync: createFinancialTransactions, isPending: isCreatingTransactions } = useCreateMultipleFinancialTransactions();

  useEffect(() => {
    if (isOpen) { // Modal her açıldığında formu sıfırla/doldur
      setErrors({});
      if (vehicleToEdit) {
        setVehicleData({
          plate: vehicleToEdit.plate,
          brand: vehicleToEdit.brand,
          model: vehicleToEdit.model,
          year: vehicleToEdit.year,
          vin: vehicleToEdit.vin || '',
          notes: vehicleToEdit.notes || '',
        });
        // Düzenleme modunda finansal alanları sıfırla (ya da mevcut işlemleri yükle - şimdilik sıfır)
        setInitialServiceFee(undefined);
        setInitialServiceDescription('');
        setPaymentReceived(undefined);
        setPaymentDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
      } else {
        setVehicleData(initialVehicleFormData);
        setInitialServiceFee(undefined);
        setInitialServiceDescription('');
        setPaymentReceived(undefined);
        setPaymentDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setIsOutsideJob(false);
        setOutsideJobName('');
      }
    }
  }, [vehicleToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Plaka alanı için her zaman büyük harfe çevir
    const nextValue =
      name === 'plate'
        ? value.toUpperCase()
        : name === 'year'
          ? parseInt(value) || new Date().getFullYear()
          : value;

    setVehicleData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (isOutsideJob && !outsideJobName.trim()) {
      toast({ title: "Eksik Bilgi", description: "Lütfen işlem veya parça adını giriniz.", status: "warning", duration: 4000, isClosable: true });
      return;
    }

    const dataToValidate = isOutsideJob ? {
      ...vehicleData,
      plate: `DIS ${Math.floor(Math.random() * 10000)}`,
      brand: 'Muhtelif',
      model: outsideJobName,
      year: new Date().getFullYear(),
    } : vehicleData;

    // Zod Validation
    const result = vehicleSchema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      logger.warn('Araç formu validasyon hatası', { errors: fieldErrors });
      return;
    }

    // Servis ücreti varsa, açıklaması da olmalı
    if (initialServiceFee && initialServiceFee > 0 && !initialServiceDescription.trim()) {
        toast({ title: "Eksik Bilgi", description: "Servis ücreti girildiğinde, servis açıklaması da zorunludur.", status: "warning", duration: 4000, isClosable: true });
        return;
    }

    // Validasyon başarılı, sanitize edilmiş veriyi al
    const validatedData = result.data as Omit<VehicleFormData, 'customer_id'>;

    const vehicleSubmissionData: VehicleCreate = {
      ...validatedData,
      customer_id: customerId,
      year: Number(validatedData.year),
    };

    try {
      let savedVehicle: Vehicle;
      let savedJob: JobType | null = null;

      if (vehicleToEdit && vehicleToEdit.id) {
        const { customer_id, ...restData } = vehicleSubmissionData; // customer_id update'de olmamalı
        savedVehicle = await updateVehicle({ id: vehicleToEdit.id, data: restData });
      } else {
        savedVehicle = await createVehicle(vehicleSubmissionData);
      }

      if (initialServiceFee && initialServiceFee > 0 && initialServiceDescription.trim()) {
        const jobData: JobCreate = {
          customer_id: customerId,
          vehicle_id: savedVehicle.id,
          job_description: initialServiceDescription.trim(),
          job_date: transactionDate || new Date().toISOString(),
          total_cost: initialServiceFee,
          status: 'Açık', // Veya ödeme durumuna göre 'Kısmi Ödendi' / 'Tamamen Ödendi'
          // notes: // İşe özel notlar buraya eklenebilir
        };
        savedJob = await createJob(jobData);
      }

      const transactionsToCreate: FinancialTransactionCreate[] = [];
      const currentTransactionDate = transactionDate || new Date().toISOString();

      if (savedJob && initialServiceFee && initialServiceFee > 0) {
        transactionsToCreate.push({
          customer_id: customerId,
          vehicle_id: savedVehicle.id,
          job_id: savedJob.id,
          transaction_type: 'SERVICE_FEE',
          amount: initialServiceFee,
          description: savedJob.job_description,
          transaction_date: currentTransactionDate,
        });
      }

      if (paymentReceived && paymentReceived > 0) {
        transactionsToCreate.push({
          customer_id: customerId,
          vehicle_id: savedVehicle.id,
          job_id: savedJob ? savedJob.id : null,
          transaction_type: 'PAYMENT',
          amount: paymentReceived,
          description: paymentDescription || `Ödeme (Araç: ${savedVehicle.plate})`,
          transaction_date: currentTransactionDate,
        });
      }

      if (transactionsToCreate.length > 0) {
        await createFinancialTransactions({
          transactions: transactionsToCreate,
          customerIdToInvalidate: customerId
        });
      }

      // İşin durumunu ödemeye göre güncelle (opsiyonel, daha gelişmiş bir adım olabilir)
      if (savedJob && paymentReceived) {
          if (paymentReceived >= savedJob.total_cost) {
              // await updateJobStatus(savedJob.id, 'Tamamen Ödendi'); // updateJobStatus hook/servisi gerekir
          } else if (paymentReceived > 0) {
              // await updateJobStatus(savedJob.id, 'Kısmi Ödendi');
          }
      }

      toast({
        title: vehicleToEdit ? 'Araç Güncellendi' : 'Araç Eklendi',
        description: 'Araç, iş ve ilgili finansal işlemler başarıyla kaydedildi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.();
      onClose();

    } catch (error) {
      console.error('Araç, iş veya finansal işlem kaydedilirken hata:', error);
      toast({
        title: 'Kayıt Hatası',
        description: `Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen bir hata.'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{vehicleToEdit ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2} color="gray.600">Araç Bilgileri</Heading>
            
            <Checkbox 
              isChecked={isOutsideJob} 
              onChange={(e) => setIsOutsideJob(e.target.checked)}
              colorScheme="blue"
              mb={2}
            >
              Bu bir dış iş / parça / ustadan gelen iştir (Plaka, marka gerekmez)
            </Checkbox>

            {isOutsideJob ? (
              <FormControl isRequired>
                <FormLabel>İşlem / Parça Adı</FormLabel>
                <Input 
                  value={outsideJobName}
                  onChange={(e) => setOutsideJobName(e.target.value)}
                  placeholder="örn: Motor Kapağı, Enjektör Tamiri"
                />
              </FormControl>
            ) : (
              <>
                <FormControl isRequired isInvalid={!!errors.plate}>
                  <FormLabel>Plaka</FormLabel>
                  <Input
                    name="plate"
                    value={vehicleData.plate}
                    onChange={handleChange}
                    placeholder="34 ABC 123"
                    textTransform="uppercase"
                  />
                  <FormErrorMessage>{errors.plate}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.brand}>
                  <FormLabel>Marka</FormLabel>
                  <Input name="brand" value={vehicleData.brand} onChange={handleChange} placeholder="örn: Ford" />
                  <FormErrorMessage>{errors.brand}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.model}>
                  <FormLabel>Model</FormLabel>
                  <Input name="model" value={vehicleData.model} onChange={handleChange} placeholder="örn: Focus" />
                  <FormErrorMessage>{errors.model}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.year}>
                  <FormLabel>Yıl</FormLabel>
                  <NumberInput 
                    name="year" 
                    value={vehicleData.year} 
                    onChange={(valueString) => handleChange({ target: { name: 'year', value: valueString } } as React.ChangeEvent<HTMLInputElement>)}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                  >
                    <NumberInputField placeholder="örn: 2023" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.year}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.vin}>
                  <FormLabel>Şasi Numarası (VIN)</FormLabel>
                  <Input name="vin" value={vehicleData.vin} onChange={handleChange} placeholder="İsteğe bağlı" />
                  <FormErrorMessage>{errors.vin}</FormErrorMessage>
                </FormControl>
              </>
            )}
            <FormControl isInvalid={!!errors.notes}>
              <FormLabel>Notlar</FormLabel>
              <Textarea name="notes" value={vehicleData.notes} onChange={handleChange} placeholder="Araçla ilgili ek notlar (isteğe bağlı)" />
              <FormErrorMessage>{errors.notes}</FormErrorMessage>
            </FormControl>

            <Divider my={4} />
            <Heading size="md" mb={2} color="gray.600">Finansal İşlemler (Opsiyonel)</Heading>

            <FormControl>
              <FormLabel htmlFor="initialServiceFee">İlk Servis/İşlem Ücreti</FormLabel>
              <NumberInput
                id="initialServiceFee"
                value={initialServiceFee || ''}
                onChange={(valueString) => setInitialServiceFee(parseFloat(valueString) || undefined)}
                min={0}
              >
                <NumberInputField placeholder="Örn: 250.00" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="initialServiceDescription">Servis/İşlem Açıklaması</FormLabel>
              <Input
                id="initialServiceDescription"
                placeholder="Örn: Periyodik bakım, Yedek parça bedeli"
                value={initialServiceDescription}
                onChange={(e) => setInitialServiceDescription(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="paymentReceived">Alınan Ödeme</FormLabel>
              <NumberInput
                id="paymentReceived"
                value={paymentReceived || ''}
                onChange={(valueString) => setPaymentReceived(parseFloat(valueString) || undefined)}
                min={0}
              >
                <NumberInputField placeholder="Örn: 100.00" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="paymentDescription">Ödeme Açıklaması</FormLabel>
              <Input
                id="paymentDescription"
                placeholder="Örn: Nakit ödeme, Kredi kartı peşinat"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="transactionDate">İşlem Tarihi</FormLabel>
              <Input
                id="transactionDate"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </FormControl>

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleSubmit} 
            isLoading={isCreatingVehicle || isUpdatingVehicle || isCreatingJob || isCreatingTransactions}
          >
            {vehicleToEdit ? 'Güncelle' : 'Kaydet'}
          </Button>
          <Button variant="ghost" onClick={onClose}>İptal</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 