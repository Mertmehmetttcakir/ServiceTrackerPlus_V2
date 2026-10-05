import { Box, Card, CardBody, CardHeader, Flex, Heading, SimpleGrid, Stat, StatLabel, StatNumber, Table, Tbody, Td, Th, Thead, Tr, Badge, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useGetCompanyFinancialTransactions } from '../../hooks/useFinancialTransactions';
import { useAllSupplierTransactions } from '../../hooks/useSuppliers';
import { formatCurrency } from '../../utils/formatters';
import { formatTimeDisplaySafe } from '../../utils/dateUtils';

export const FinanceDashboard: React.FC = () => {
  const { data: transactions, isLoading, error } = useGetCompanyFinancialTransactions();
  const { data: supplierTransactions, isLoading: isLoadingSuppliers } = useAllSupplierTransactions();

  const stats = useMemo(() => {
    if (!transactions) return { totalIncome: 0, totalServiceFee: 0, totalReceivables: 0, totalSupplierDebt: 0 };
    
    let totalIncome = 0;
    let totalServiceFee = 0;
    
    transactions.forEach(t => {
      if (t.transaction_type === 'PAYMENT') totalIncome += t.amount;
      if (t.transaction_type === 'SERVICE_FEE') totalServiceFee += t.amount;
    });

    let totalSupplierDebt = 0;
    if (supplierTransactions) {
      let supplierDebt = 0;
      let supplierPaid = 0;
      supplierTransactions.forEach(t => {
        if (t.transaction_type === 'DEBT') supplierDebt += t.amount;
        if (t.transaction_type === 'PAYMENT') supplierPaid += t.amount;
      });
      totalSupplierDebt = supplierDebt - supplierPaid;
    }

    return {
      totalIncome,
      totalServiceFee,
      totalReceivables: totalServiceFee - totalIncome, // Basit alacak hesabı
      totalSupplierDebt: totalSupplierDebt > 0 ? totalSupplierDebt : 0
    };
  }, [transactions, supplierTransactions]);

  if (isLoading || isLoadingSuppliers) return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  if (error) return <Alert status="error"><AlertIcon />Finansal veriler yüklenirken hata oluştu.</Alert>;

  return (
    <Box p={5}>
      <Heading mb={6}>Kasa ve Finans Yönetimi</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card borderLeft="4px solid" borderColor="green.400" shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Toplam Tahsilat (Kasa)</StatLabel>
              <StatNumber color="green.500">{formatCurrency(stats.totalIncome)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card borderLeft="4px solid" borderColor="blue.400" shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Toplam Kesilen Fatura/İşlem</StatLabel>
              <StatNumber color="blue.500">{formatCurrency(stats.totalServiceFee)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card borderLeft="4px solid" borderColor="red.400" shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Piyasadaki Alacak (Bekleyen)</StatLabel>
              <StatNumber color="red.500">{formatCurrency(stats.totalReceivables > 0 ? stats.totalReceivables : 0)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card borderLeft="4px solid" borderColor="orange.400" shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Tedarikçi Borçlarımız</StatLabel>
              <StatNumber color="orange.500">{formatCurrency(stats.totalSupplierDebt)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card shadow="sm">
        <CardHeader>
          <Heading size="md">Son Finansal Hareketler</Heading>
        </CardHeader>
        <CardBody overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Tarih</Th>
                <Th>Müşteri</Th>
                <Th>İşlem Türü</Th>
                <Th>Açıklama</Th>
                <Th isNumeric>Tutar</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions?.map((tx) => (
                <Tr key={tx.id}>
                  <Td>{formatTimeDisplaySafe(tx.transaction_date)}</Td>
                  <Td>{tx.customer?.full_name}</Td>
                  <Td>
                    <Badge colorScheme={tx.transaction_type === 'PAYMENT' ? 'green' : 'blue'}>
                      {tx.transaction_type === 'PAYMENT' ? 'Tahsilat' : 'İşlem Bedeli'}
                    </Badge>
                  </Td>
                  <Td>{tx.description || (tx as any).job?.job_description || '-'}</Td>
                  <Td isNumeric fontWeight="bold" color={tx.transaction_type === 'PAYMENT' ? 'green.600' : 'gray.700'}>
                    {tx.transaction_type === 'PAYMENT' ? '+' : ''}{formatCurrency(tx.amount)}
                  </Td>
                </Tr>
              ))}
              {(!transactions || transactions.length === 0) && (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4} color="gray.500">
                    Henüz finansal hareket bulunmamaktadır.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
};
