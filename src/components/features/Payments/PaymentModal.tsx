import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
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
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useCreateFinancialTransaction } from '../../../hooks/useFinancialTransactions';
import { FinancialTransactionCreate } from '../../../types/financial';
import { JobSummary } from '../../../types/job';
import { formatCurrency } from '../../../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobSummary | null;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  job,
  onPaymentSuccess,
}) => {
  const toast = useToast();
  const [amount, setAmount] = useState<number | string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { mutate: createPayment, isPending: isCreatingPayment } = useCreateFinancialTransaction();

  if (!job) return null;

  const remainingBalance = job.remaining_balance_for_job ?? 0;

  const handlePaymentSubmit = async () => {
    setPaymentError(null);
    const numericAmount = parseFloat(String(amount));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setPaymentError('Geçerli bir ödeme miktarı giriniz.');
      return;
    }
    if (numericAmount > remainingBalance) {
      setPaymentError(`Maksimum ödeme tutarı ${formatCurrency(remainingBalance)} olabilir.`);
      return;
    }

    const paymentData: FinancialTransactionCreate = {
      customer_id: job.customer_id,
      job_id: job.id,
      vehicle_id: job.vehicle_id || null, // vehicle_id null olabilir
      transaction_type: 'PAYMENT',
      amount: numericAmount,
      description: `${job.job_description} için ödeme`,
      transaction_date: new Date().toISOString(),
    };

    createPayment(paymentData, {
      onSuccess: () => {
        toast({
          title: 'Ödeme Başarılı',
          description: `${formatCurrency(numericAmount)} tutarındaki ödeme alındı.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onPaymentSuccess();
        setAmount(''); // Formu sıfırla
        onClose();
      },
      onError: (error) => {
        const errorMessage = error.message || 'Ödeme sırasında bir hata oluştu.';
        setPaymentError(errorMessage);
        toast({
          title: 'Ödeme Hatası',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  const handleModalClose = () => {
    setAmount('');
    setPaymentError(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>İş İçin Ödeme Yap</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box p={4} borderWidth="1px" borderRadius="md" w="full" bg="gray.50">
              <Text fontWeight="bold">İş: {job.job_description}</Text>
              <Text fontSize="sm">Tarih: {new Date(job.job_date).toLocaleDateString()}</Text>
              <Flex justifyContent="space-between" mt={2}>
                <Text>Toplam Tutar:</Text>
                <Text fontWeight="bold">{formatCurrency(job.total_cost ?? 0)}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text>Ödenen Tutar:</Text>
                <Text fontWeight="bold" color="green.500">{formatCurrency(job.total_paid_for_job ?? 0)}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text>Kalan Bakiye:</Text>
                <Text fontWeight="bold" color={remainingBalance > 0 ? "red.500" : "green.500"}>
                  {formatCurrency(remainingBalance)}
                </Text>
              </Flex>
            </Box>
            
            <FormControl isRequired isInvalid={!!paymentError}>
              <FormLabel htmlFor="paymentAmount">Ödenecek Tutar</FormLabel>
              <NumberInput
                id="paymentAmount"
                value={amount}
                onChange={(valueString) => setAmount(valueString)}
                min={0.01}
                clampValueOnBlur={false}
                precision={2}
                step={10}
              >
                <NumberInputField placeholder={`Maksimum ${formatCurrency(remainingBalance)}`} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {paymentError && <FormErrorMessage><Icon as={InfoOutlineIcon} mr={1}/>{paymentError}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={handleModalClose} mr={3}>
            İptal
          </Button>
          <Button
            colorScheme="blue"
            onClick={handlePaymentSubmit}
            isLoading={isCreatingPayment}
            isDisabled={remainingBalance <= 0} // Kalan borç yoksa butonu disable et
          >
            {remainingBalance <= 0 ? 'Borç Yok' : 'Ödemeyi Tamamla'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 