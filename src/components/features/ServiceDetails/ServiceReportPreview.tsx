import { DownloadIcon, EmailIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import { useServiceReport } from '../../../hooks/useServiceReport';

interface ServiceReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  customerName: string;
}

export const ServiceReportPreview: React.FC<ServiceReportPreviewProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  customerName,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isGenerating, downloadExistingReport, generateAndDownloadReport } = useServiceReport();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPdfPreview();
    }
    
    return () => {
      // PDF URL'i temizle
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [isOpen, serviceId]);

  const loadPdfPreview = async () => {
    try {
      setIsLoading(true);
      // Burada gerçek bir PDF yükleme işlemi olacak
      // Bu örnek için sadece bir gecikme simüle ediyoruz
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'PDF yüklenirken bir sorun oluştu',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const success = await downloadExistingReport(serviceId, `${customerName.replace(/\s+/g, '-')}-servis-raporu.pdf`);
      if (!success) {
        toast({
          title: 'Hata',
          description: 'PDF indirilirken bir sorun oluştu',
          status: 'error',
          duration: 3000,
        });
      } else {
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'PDF indirilirken bir sorun oluştu',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleGenerateNew = async () => {
    try {
      const success = await generateAndDownloadReport(serviceId, `${customerName.replace(/\s+/g, '-')}-servis-raporu.pdf`);
      if (success) {
        toast({
          title: 'PDF Oluşturuldu',
          description: 'Servis raporu oluşturuldu ve indirildi',
          status: 'success',
          duration: 3000,
        });
        onClose();
      } else {
        toast({
          title: 'Hata',
          description: 'PDF oluşturulurken bir sorun oluştu',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'PDF oluşturulurken bir sorun oluştu',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      printWindow?.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const handleEmailReport = () => {
    // Email gönderme fonksiyonu burada eklenecek
    toast({
      title: 'Bilgi',
      description: 'E-posta gönderme özelliği yakında eklenecek',
      status: 'info',
      duration: 3000,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent h="80vh">
        <ModalHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="md">{serviceName}</Heading>
              <Text fontSize="sm" color="gray.600">
                {customerName} - Servis Raporu
              </Text>
            </Box>
            <Flex>
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                mr={2}
                onClick={handleDownload}
                isDisabled={isLoading || isGenerating}
              >
                İndir
              </Button>
              <Button
                leftIcon={<FaPrint />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                mr={2}
                onClick={handlePrint}
                isDisabled={isLoading || !pdfUrl}
              >
                Yazdır
              </Button>
              <Button
                leftIcon={<EmailIcon />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={handleEmailReport}
                isDisabled={isLoading || isGenerating}
              >
                E-posta Gönder
              </Button>
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" height="100%">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              bg="gray.100"
              borderRadius="md"
            >
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="100%"
                  title="Servis Raporu"
                  style={{ border: 'none', borderRadius: '0.375rem' }}
                />
              ) : (
                <Flex direction="column" align="center" justify="center">
                  <FaFilePdf size={64} color="#E53E3E" />
                  <Text mt={4} fontWeight="medium">
                    PDF önizleme mevcut değil
                  </Text>
                  <Text mt={2} color="gray.600" textAlign="center">
                    Servis raporu PDF'i henüz oluşturulmamış veya yüklenemedi.
                    <br />
                    Yeni bir PDF oluşturmak için aşağıdaki butonu kullanabilirsiniz.
                  </Text>
                  <Button
                    leftIcon={<FaFilePdf />}
                    colorScheme="red"
                    mt={4}
                    onClick={handleGenerateNew}
                    isLoading={isGenerating}
                  >
                    PDF Oluştur
                  </Button>
                </Flex>
              )}
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Kapat
          </Button>
          <Button colorScheme="blue" onClick={handleGenerateNew} isLoading={isGenerating}>
            Yeni PDF Oluştur
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 