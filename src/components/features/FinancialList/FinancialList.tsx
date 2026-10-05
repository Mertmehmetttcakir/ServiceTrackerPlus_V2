import { AddIcon, DownloadIcon } from '@chakra-ui/icons';
import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react';
import React from 'react';
import { Financial } from '../../../types';

interface FinancialListProps {
  transactions: Financial[];
  onDownloadInvoice?: (transactionId: string) => void;
  onAddPayment?: () => void;
}

const getStatusColor = (status: Financial['status']) => {
  switch (status) {
    case 'paid':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'overdue':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusText = (status: Financial['status']) => {
  switch (status) {
    case 'paid':
      return 'Ödendi';
    case 'pending':
      return 'Bekliyor';
    case 'overdue':
      return 'Gecikmiş';
    default:
      return status;
  }
};

export const FinancialList: React.FC<FinancialListProps> = ({
  transactions,
  onDownloadInvoice,
  onAddPayment,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Finansal İşlemler</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={onAddPayment}>
          Yeni Ödeme
        </Button>
      </Flex>

      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
      >
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Tarih</Th>
              <Th>Fatura No</Th>
              <Th>Müşteri</Th>
              <Th>Tutar</Th>
              <Th>Durum</Th>
              <Th>İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((transaction) => (
              <Tr key={transaction.id}>
                <Td>{new Date(transaction.date).toLocaleDateString('tr-TR')}</Td>
                <Td>{transaction.invoiceNumber}</Td>
                <Td>{transaction.customerName}</Td>
                <Td isNumeric>{formatCurrency(transaction.amount)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(transaction.status)}>
                    {getStatusText(transaction.status)}
                  </Badge>
                </Td>
                <Td>
                  <IconButton
                    aria-label="Faturayı İndir"
                    icon={<DownloadIcon />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => onDownloadInvoice?.(transaction.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}; 