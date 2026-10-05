import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Table, Tbody, Td, Th, Thead, Tr, Badge, Spinner, Alert, AlertIcon, SimpleGrid, Stat, StatLabel, StatNumber, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, useDisclosure, useToast, Text, Tabs, TabList, Tab, TabPanels, TabPanel, IconButton, Image, Link } from '@chakra-ui/react';
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupplier, useSupplierTransactions, useCreateSupplierTransaction, useSupplierInvoices, useCreateSupplierInvoice } from '../../hooks/useSuppliers';
import { SupplierTransactionCreate } from '../../types/supplier';
import { FiArrowLeft, FiPlus, FiFileText, FiDownload, FiExternalLink } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import { formatTimeDisplaySafe } from '../../utils/dateUtils';
import { StorageService } from '../../services/storageService';

export const SupplierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  // İşlem Modalı
  const { isOpen: isTxOpen, onOpen: onTxOpen, onClose: onTxClose } = useDisclosure();
  // Fatura Modalı
  const { isOpen: isInvOpen, onOpen: onInvOpen, onClose: onInvClose } = useDisclosure();

  const { data: supplier, isLoading: isLoadingSupplier } = useSupplier(id);
  const { data: transactions, isLoading: isLoadingTransactions } = useSupplierTransactions(id || '');
  const { data: invoices, isLoading: isLoadingInvoices } = useSupplierInvoices(id || '');
  
  const { mutate: createTransaction, isPending: isCreatingTx } = useCreateSupplierTransaction();
  const { mutate: createInvoice, isPending: isCreatingInv } = useCreateSupplierInvoice();

  // İşlem Form State
  const [txFormData, setTxFormData] = useState<Omit<SupplierTransactionCreate, 'supplier_id'>>({
    transaction_type: 'DEBT',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  // Fatura Form State
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [filterType, setFilterType] = useState<'ALL' | 'DEBT' | 'PAYMENT'>('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');
  const [invSortOrder, setInvSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  const sortedInvoices = useMemo(() => {
    if (!invoices) return [];
    return [...invoices].sort((a, b) => {
      const dateA = new Date(a.invoice_date).getTime();
      const dateB = new Date(b.invoice_date).getTime();
      return invSortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });
  }, [invoices, invSortOrder]);

  const filteredAndSortedTransactions = useMemo(() => {
    if (!transactions) return [];
    let result = [...transactions];
    if (filterType !== 'ALL') {
      result = result.filter(t => t.transaction_type === filterType);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();
      return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [transactions, filterType, sortOrder]);

  const stats = useMemo(() => {
    if (!transactions) return { totalDebt: 0, totalPaid: 0, remainingDebt: 0 };
    let totalDebt = 0;
    let totalPaid = 0;
    transactions.forEach(t => {
      if (t.transaction_type === 'DEBT') totalDebt += t.amount;
      if (t.transaction_type === 'PAYMENT') totalPaid += t.amount;
    });
    return {
      totalDebt,
      totalPaid,
      remainingDebt: totalDebt - totalPaid
    };
  }, [transactions]);

  const handleTxSubmit = () => {
    if (!id || !txFormData.amount || txFormData.amount <= 0 || !txFormData.transaction_date) {
      toast({ title: 'Hata', description: 'Geçerli bir tutar ve tarih giriniz.', status: 'error' });
      return;
    }

    createTransaction({
      supplier_id: id,
      ...txFormData,
      amount: Number(txFormData.amount),
      transaction_date: txFormData.transaction_date.includes('T') 
        ? txFormData.transaction_date 
        : new Date(txFormData.transaction_date).toISOString()
    }, {
      onSuccess: () => {
        toast({ title: 'Başarılı', description: 'İşlem kaydedildi.', status: 'success' });
        onTxClose();
        setTxFormData({ 
          transaction_type: 'DEBT', 
          amount: 0, 
          description: '', 
          transaction_date: new Date().toISOString().split('T')[0] 
        });
      }
    });
  };

  const handleInvSubmit = async () => {
    if (!id || !invDate || !invoiceFile) {
      toast({ title: 'Hata', description: 'Tarih ve dosya seçimi zorunludur.', status: 'error' });
      return;
    }

    setIsUploading(true);
    const { url, error } = await StorageService.uploadFile(invoiceFile, 'documents', 'supplier_invoices');
    setIsUploading(false);
    
    if (error) {
      toast({ title: 'Yükleme Hatası', description: error, status: 'error' });
      return;
    }

    createInvoice({
      supplier_id: id,
      file_url: url,
      invoice_date: invDate.includes('T') ? invDate : new Date(invDate).toISOString()
    }, {
      onSuccess: () => {
        toast({ title: 'Başarılı', description: 'Fatura kaydedildi.', status: 'success' });
        onInvClose();
        setInvDate(new Date().toISOString().split('T')[0]);
        setInvoiceFile(null);
      }
    });
  };

  if (isLoadingSupplier) return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  if (!supplier) return <Alert status="error"><AlertIcon />Tedarikçi bulunamadı.</Alert>;

  return (
    <Box p={5}>
      <Flex align="center" mb={6}>
        <Button leftIcon={<FiArrowLeft />} variant="ghost" onClick={() => navigate('/suppliers')} mr={4}>
          Geri
        </Button>
        <Heading size="lg">{supplier.company_name} - Hesap Detayı</Heading>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card borderLeft="4px solid" borderColor="red.400" shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Toplam Borcumuz (Alınan Ürünler)</StatLabel>
              <StatNumber color="red.500">{formatCurrency(stats.totalDebt)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card borderLeft="4px solid" borderColor="green.400" shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Toplam Yapılan Ödeme</StatLabel>
              <StatNumber color="green.500">{formatCurrency(stats.totalPaid)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card borderLeft="4px solid" borderColor={stats.remainingDebt > 0 ? "orange.400" : "blue.400"} shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">Kalan Borç (Bakiye)</StatLabel>
              <StatNumber color={stats.remainingDebt > 0 ? "orange.500" : "blue.500"}>
                {formatCurrency(stats.remainingDebt)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab fontWeight="bold">Hesap Hareketleri (Ürünler & Ödemeler)</Tab>
          <Tab fontWeight="bold">Fatura Dokümanları</Tab>
        </TabList>
        <TabPanels>
          {/* Hesap Hareketleri Sekmesi */}
          <TabPanel px={0} pt={4}>
            <Card shadow="sm">
              <CardHeader>
                <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} gap={4}>
                  <Heading size="md">İşlem Listesi</Heading>
                  
                  <Flex gap={3} align="center" wrap="wrap">
                    <Select 
                      size="sm" 
                      w="150px" 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value as any)}
                    >
                      <option value="ALL">Tümü</option>
                      <option value="DEBT">Sadece Alınan Ürünler</option>
                      <option value="PAYMENT">Sadece Ödemeler</option>
                    </Select>
                    
                    <Select 
                      size="sm" 
                      w="180px" 
                      value={sortOrder} 
                      onChange={(e) => setSortOrder(e.target.value as any)}
                    >
                      <option value="DESC">En Son Alınan/Ödenen İlk</option>
                      <option value="ASC">Eskiden Yeniye</option>
                    </Select>

                    <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm" onClick={onTxOpen}>
                      Yeni İşlem Ekle
                    </Button>
                  </Flex>
                </Flex>
              </CardHeader>
              <CardBody overflowX="auto">
                {isLoadingTransactions ? (
                  <Flex justify="center" p={10}><Spinner size="md" /></Flex>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Tarih</Th>
                        <Th>İşlem Türü</Th>
                        <Th>Açıklama (Ürünler)</Th>
                        <Th isNumeric>Tutar</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredAndSortedTransactions.map((tx) => (
                        <Tr key={tx.id}>
                          <Td>{formatTimeDisplaySafe(tx.transaction_date)}</Td>
                          <Td>
                            <Badge colorScheme={tx.transaction_type === 'DEBT' ? 'red' : 'green'}>
                              {tx.transaction_type === 'DEBT' ? 'Borç / Alınan Ürün' : 'Ödeme Yapıldı'}
                            </Badge>
                          </Td>
                          <Td>
                            <Text maxW="300px" isTruncated title={tx.description || ''}>
                              {tx.description || '-'}
                            </Text>
                          </Td>
                          <Td isNumeric fontWeight="bold" color={tx.transaction_type === 'DEBT' ? 'red.500' : 'green.500'}>
                            {tx.transaction_type === 'DEBT' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </Td>
                        </Tr>
                      ))}
                      {filteredAndSortedTransactions.length === 0 && (
                        <Tr>
                          <Td colSpan={4} textAlign="center" py={4} color="gray.500">
                            Görüntülenecek işlem bulunamadı.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Fatura Dokümanları Sekmesi */}
          <TabPanel px={0} pt={4}>
            <Card shadow="sm">
              <CardHeader>
                <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} gap={4}>
                  <Heading size="md">Tedarikçi Faturaları (Görsel Arşiv)</Heading>
                  
                  <Flex gap={3} align="center" wrap="wrap">
                    <Select 
                      size="sm" 
                      w="180px" 
                      value={invSortOrder} 
                      onChange={(e) => setInvSortOrder(e.target.value as any)}
                    >
                      <option value="DESC">En Yeniden Eskiye</option>
                      <option value="ASC">Eskiden Yeniye</option>
                    </Select>

                    <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm" onClick={onInvOpen}>
                      Fatura Dokümanı Yükle
                    </Button>
                  </Flex>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingInvoices ? (
                  <Flex justify="center" p={10}><Spinner size="md" /></Flex>
                ) : (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                    {sortedInvoices?.map(inv => (
                      <Card key={inv.id} variant="outline" overflow="hidden">
                        <Box h="150px" bg="gray.100" position="relative">
                          {inv.file_url.toLowerCase().endsWith('.pdf') ? (
                            <Flex h="100%" align="center" justify="center" direction="column" color="red.500">
                              <FiFileText size={48} />
                              <Text mt={2} fontWeight="bold" fontSize="sm">PDF Dokümanı</Text>
                            </Flex>
                          ) : (
                            <Image src={inv.file_url} objectFit="cover" w="100%" h="100%" fallback={<Flex h="100%" align="center" justify="center"><FiFileText size={48} color="gray" /></Flex>} />
                          )}
                        </Box>
                        <CardBody p={3}>
                          <Text fontWeight="bold" fontSize="sm" mb={2}>
                            Tarih: {new Date(inv.invoice_date).toLocaleDateString('tr-TR')}
                          </Text>
                          <Button 
                            as="a" 
                            href={inv.file_url} 
                            target="_blank" 
                            size="sm" 
                            w="100%" 
                            colorScheme="gray" 
                            leftIcon={<FiExternalLink />}
                          >
                            Görüntüle
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                    {(!invoices || invoices.length === 0) && (
                      <Box gridColumn="1 / -1" textAlign="center" py={10} color="gray.500">
                        Henüz fatura dokümanı yüklenmemiş.
                      </Box>
                    )}
                  </SimpleGrid>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* İŞLEM EKLE MODALI */}
      <Modal isOpen={isTxOpen} onClose={onTxClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tedarikçi İşlemi Ekle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>İşlem Türü</FormLabel>
              <Select 
                value={txFormData.transaction_type} 
                onChange={(e) => setTxFormData({...txFormData, transaction_type: e.target.value as 'DEBT' | 'PAYMENT'})}
              >
                <option value="DEBT">Ürün Alındı (Borç Yazıldı)</option>
                <option value="PAYMENT">Ödeme Yapıldı (Borç Düşüldü)</option>
              </Select>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Tarih</FormLabel>
              <Input 
                type="date"
                value={txFormData.transaction_date} 
                onChange={(e) => setTxFormData({...txFormData, transaction_date: e.target.value})} 
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Tutar (TL)</FormLabel>
              <Input 
                type="number"
                value={txFormData.amount || ''} 
                onChange={(e) => setTxFormData({...txFormData, amount: parseFloat(e.target.value)})} 
                placeholder="Örn: 1500"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>
                {txFormData.transaction_type === 'DEBT' ? 'Alınan Ürünler / Açıklama' : 'Ödeme Açıklaması'}
              </FormLabel>
              <Input 
                value={txFormData.description || ''} 
                onChange={(e) => setTxFormData({...txFormData, description: e.target.value})} 
                placeholder={txFormData.transaction_type === 'DEBT' ? 'Örn: Fren balatası 2 adet, Hava filtresi 1 adet' : 'Örn: Nakit ödendi'}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTxClose} isDisabled={isCreatingTx}>İptal</Button>
            <Button colorScheme="blue" onClick={handleTxSubmit} isLoading={isCreatingTx}>Kaydet</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* FATURA YÜKLE MODALI */}
      <Modal isOpen={isInvOpen} onClose={() => { onInvClose(); setInvoiceFile(null); }} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Fatura Dokümanı Yükle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="info" mb={4} size="sm" borderRadius="md">
              <AlertIcon />
              Buraya yüklenen faturalar sadece görsel arşiv amaçlıdır, toplam borç bakiyesini etkilemez.
            </Alert>
            <FormControl mb={4} isRequired>
              <FormLabel>Fatura Tarihi</FormLabel>
              <Input 
                type="date"
                value={invDate} 
                onChange={(e) => setInvDate(e.target.value)} 
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Fatura Görseli (Fotoğraf veya PDF)</FormLabel>
              <Input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setInvoiceFile(e.target.files[0]);
                  }
                }}
                p={1}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInvClose} isDisabled={isUploading || isCreatingInv}>İptal</Button>
            <Button colorScheme="blue" onClick={handleInvSubmit} isLoading={isUploading || isCreatingInv}>
              {isUploading ? 'Yükleniyor...' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
