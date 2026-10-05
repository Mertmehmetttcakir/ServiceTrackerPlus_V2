import { DownloadIcon, InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    Heading,
    HStack,
    Icon,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Progress,
    Select,
    SimpleGrid,
    Spinner,
    Stat,
    StatLabel,
    StatNumber,
    Switch,
    Text,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiDatabase, FiFile, FiImage, FiUsers } from 'react-icons/fi';
import {
    useCreateBackup,
    useResetSettings,
    useSystemInfo,
    useSystemSettings,
    useUpdateSystemSettings
} from '../../../hooks/useSettings';
import { StorageService } from '../../../services/storageService';
import { SystemSettingsUpdate } from '../../../types/settings';

export const SystemSettings: React.FC = () => {
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useSystemSettings();
  const { data: systemInfo, isLoading: infoLoading } = useSystemInfo();
  const updateMutation = useUpdateSystemSettings();
  const resetMutation = useResetSettings();
  const backupMutation = useCreateBackup();

  const [formData, setFormData] = useState<SystemSettingsUpdate>({});

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Ayarlar yüklendiğinde form verilerini güncelle
  React.useEffect(() => {
    if (settings) {
      setFormData({
        language: settings.language,
        timezone: settings.timezone,
        currency: settings.currency,
        date_format: settings.date_format,
        records_per_page: settings.records_per_page,
      monthly_appointment_target: settings.monthly_appointment_target,
      monthly_revenue_target: settings.monthly_revenue_target,
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        appointment_reminders: settings.appointment_reminders,
        payment_reminders: settings.payment_reminders,
        session_timeout: settings.session_timeout,
        auto_logout: settings.auto_logout,
        auto_backup: settings.auto_backup,
        backup_frequency: settings.backup_frequency,
      });
    }
  }, [settings]);

  const handleInputChange = (field: keyof SystemSettingsUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      // Hata toast'u hook tarafından gösterilir
    }
  };

  const handleReset = async () => {
    if (window.confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      try {
        await resetMutation.mutateAsync();
      } catch (error) {
        // Hata toast'u hook tarafından gösterilir
      }
    }
  };

  const handleBackup = async () => {
    try {
      await backupMutation.mutateAsync();
    } catch (error) {
      // Hata toast'u hook tarafından gösterilir
    }
  };

  if (settingsLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (settingsError) {
    return (
      <Alert status="error">
        <AlertIcon />
        Sistem ayarları yüklenirken bir hata oluştu: {settingsError.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Sistem Ayarları</Heading>

        {/* Sistem Bilgileri */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Sistem Bilgileri</Heading>
          </CardHeader>
          <CardBody>
            {infoLoading ? (
              <Flex justify="center" py={4}>
                <Spinner />
              </Flex>
            ) : systemInfo ? (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Uygulama Versiyonu</StatLabel>
                  <StatNumber fontSize="md">{systemInfo.app_version}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Toplam Müşteri</StatLabel>
                  <StatNumber fontSize="md">{systemInfo.total_customers}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Toplam İş</StatLabel>
                  <StatNumber fontSize="md">{systemInfo.total_jobs}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Storage Planı</StatLabel>
                  <StatNumber fontSize="md">
                    <Badge colorScheme={systemInfo.storage_plan === 'Free' ? 'gray' : systemInfo.storage_plan === 'Pro' ? 'blue' : 'green'}>
                      {systemInfo.storage_plan || 'Free'}
                    </Badge>
                  </StatNumber>
                </Stat>
              </SimpleGrid>
            ) : (
              <Text>Sistem bilgileri yüklenemedi</Text>
            )}
          </CardBody>
        </Card>

        {/* Depolama Kullanımı Detayları */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Depolama Kullanımı</Heading>
          </CardHeader>
          <CardBody>
            {infoLoading ? (
              <Flex justify="center" py={4}>
                <Spinner />
              </Flex>
            ) : systemInfo ? (
              <VStack spacing={4} align="stretch">
                {/* Genel Kullanım */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Toplam Kullanım</Text>
                    <Text>
                      {StorageService.formatStorageSize(systemInfo.storage_used)} / {StorageService.formatStorageSize(systemInfo.storage_limit)}
                    </Text>
                  </HStack>
                  <Progress 
                    value={StorageService.calculateUsagePercentage(systemInfo.storage_used, systemInfo.storage_limit)} 
                    colorScheme={StorageService.calculateUsagePercentage(systemInfo.storage_used, systemInfo.storage_limit) > 80 ? 'red' : 'blue'}
                    size="lg"
                    bg="gray.100"
                  />
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    %{StorageService.calculateUsagePercentage(systemInfo.storage_used, systemInfo.storage_limit)} kullanıldı
                  </Text>
                </Box>

                {/* Detaylı Breakdown */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Tooltip label="Şirket logoları ve markalar">
                    <Box p={3} borderRadius="md" bg="blue.50" borderColor="blue.200" borderWidth={1}>
                      <HStack spacing={2}>
                        <Icon as={FiImage} color="blue.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="blue.600" fontWeight="medium">Logolar</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {StorageService.formatStorageSize(systemInfo.storage_breakdown?.companyLogos || 0)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </Tooltip>

                  <Tooltip label="Kullanıcı profil fotoğrafları">
                    <Box p={3} borderRadius="md" bg="green.50" borderColor="green.200" borderWidth={1}>
                      <HStack spacing={2}>
                        <Icon as={FiUsers} color="green.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="green.600" fontWeight="medium">Profil</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {StorageService.formatStorageSize(systemInfo.storage_breakdown?.profilePhotos || 0)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </Tooltip>

                  <Tooltip label="Belgeler ve rapor dosyaları">
                    <Box p={3} borderRadius="md" bg="orange.50" borderColor="orange.200" borderWidth={1}>
                      <HStack spacing={2}>
                        <Icon as={FiFile} color="orange.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="orange.600" fontWeight="medium">Belgeler</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {StorageService.formatStorageSize(systemInfo.storage_breakdown?.documents || 0)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </Tooltip>

                  <Tooltip label="Veritabanı kayıtları">
                    <Box p={3} borderRadius="md" bg="purple.50" borderColor="purple.200" borderWidth={1}>
                      <HStack spacing={2}>
                        <Icon as={FiDatabase} color="purple.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="purple.600" fontWeight="medium">Veritabanı</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {StorageService.formatStorageSize(systemInfo.storage_breakdown?.database || 0)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </Tooltip>
                </SimpleGrid>

                {/* Plan Bilgisi */}
                <Box p={3} borderRadius="md" bg="gray.50" borderWidth={1}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Mevcut Plan: {systemInfo.storage_plan || 'Free'}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {(systemInfo.storage_plan || 'Free') === 'Free' && 'En fazla 50 müşteri, 500MB depolama'}
                        {(systemInfo.storage_plan || 'Free') === 'Pro' && 'En fazla 200 müşteri, 8GB depolama'}
                        {(systemInfo.storage_plan || 'Free') === 'Team' && 'Sınırsız müşteri, 100GB depolama'}
                      </Text>
                    </VStack>
                    {StorageService.calculateUsagePercentage(systemInfo.storage_used, systemInfo.storage_limit) > 80 && (
                      <Badge colorScheme="red">Limit yaklaşıyor</Badge>
                    )}
                  </HStack>
                </Box>
              </VStack>
            ) : (
              <Text>Depolama bilgileri yüklenemedi</Text>
            )}
          </CardBody>
        </Card>

        {/* Uygulama Ayarları */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Uygulama Ayarları</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel>Dil</FormLabel>
                <Select
                  value={formData.language || 'tr'}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </Select>
              </FormControl>


              <FormControl>
                <FormLabel>Para Birimi</FormLabel>
                <Select
                  value={formData.currency || 'TRY'}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <option value="TRY">₺ Türk Lirası</option>
                  <option value="USD">$ Amerikan Doları</option>
                  <option value="EUR">€ Euro</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Tarih Formatı</FormLabel>
                <Select
                  value={formData.date_format || 'DD/MM/YYYY'}
                  onChange={(e) => handleInputChange('date_format', e.target.value)}
                >
                  <option value="DD/MM/YYYY">Gün/Ay/Yıl</option>
                  <option value="MM/DD/YYYY">Ay/Gün/Yıl</option>
                  <option value="YYYY-MM-DD">Yıl-Ay-Gün</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Sayfa Başına Kayıt</FormLabel>
                <NumberInput
                  value={formData.records_per_page || 25}
                  onChange={(valueString) => handleInputChange('records_per_page', parseInt(valueString) || 25)}
                  min={10}
                  max={100}
                  step={5}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Aylık Randevu Hedefi</FormLabel>
                <NumberInput
                  value={formData.monthly_appointment_target ?? 150}
                  onChange={(valueString) =>
                    handleInputChange('monthly_appointment_target', parseInt(valueString) || 0)
                  }
                  min={0}
                  step={10}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Aylık Gelir Hedefi</FormLabel>
                <NumberInput
                  value={formData.monthly_revenue_target ?? 50000}
                  onChange={(valueString) =>
                    handleInputChange('monthly_revenue_target', parseInt(valueString) || 0)
                  }
                  min={0}
                  step={1000}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Bildirim Ayarları */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Bildirim Ayarları</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">E-posta Bildirimleri</Text>
                  <Text fontSize="sm" color="gray.600">Sistem bildirimleri e-posta ile gönderilsin</Text>
                </VStack>
                <Switch
                  isChecked={formData.email_notifications || false}
                  onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">SMS Bildirimleri</Text>
                  <Text fontSize="sm" color="gray.600">Önemli bildirimler SMS ile gönderilsin</Text>
                </VStack>
                <Switch
                  isChecked={formData.sms_notifications || false}
                  onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Randevu Hatırlatmaları</Text>
                  <Text fontSize="sm" color="gray.600">Yaklaşan randevular için hatırlatma gönder</Text>
                </VStack>
                <Switch
                  isChecked={formData.appointment_reminders || false}
                  onChange={(e) => handleInputChange('appointment_reminders', e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Ödeme Hatırlatmaları</Text>
                  <Text fontSize="sm" color="gray.600">Bekleyen ödemeler için hatırlatma gönder</Text>
                </VStack>
                <Switch
                  isChecked={formData.payment_reminders || false}
                  onChange={(e) => handleInputChange('payment_reminders', e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Güvenlik Ayarları */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Güvenlik Ayarları</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel>Oturum Zaman Aşımı (Dakika)</FormLabel>
                <NumberInput
                  value={formData.session_timeout || 60}
                  onChange={(valueString) => handleInputChange('session_timeout', parseInt(valueString) || 60)}
                  min={15}
                  max={480}
                  step={15}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <VStack align="start" spacing={2}>
                  <FormLabel mb={0}>Otomatik Çıkış</FormLabel>
                  <HStack>
                    <Switch
                      isChecked={formData.auto_logout || false}
                      onChange={(e) => handleInputChange('auto_logout', e.target.checked)}
                      colorScheme="blue"
                    />
                    <Text fontSize="sm" color="gray.600">
                      Belirlenen süre sonra otomatik çıkış yap
                    </Text>
                  </HStack>
                </VStack>
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Yedekleme Ayarları */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Yedekleme Ayarları</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Otomatik Yedekleme</Text>
                  <Text fontSize="sm" color="gray.600">Verilerin düzenli olarak yedeklenmesi</Text>
                </VStack>
                <Switch
                  isChecked={formData.auto_backup || false}
                  onChange={(e) => handleInputChange('auto_backup', e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>

              {formData.auto_backup && (
                <FormControl>
                  <FormLabel>Yedekleme Sıklığı</FormLabel>
                  <Select
                    value={formData.backup_frequency || 'weekly'}
                    onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                  >
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                  </Select>
                </FormControl>
              )}

              <Divider />

              <HStack spacing={4} w="full">
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="green"
                  onClick={handleBackup}
                  isLoading={backupMutation.isPending}
                >
                  Manuel Yedekleme
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Verilerinizi hemen yedekleyin
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Eylem Butonları */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <HStack>
                <InfoIcon color="blue.500" />
                <Text color="gray.600">
                  Değişiklikleri kaydetmeyi unutmayın
                </Text>
              </HStack>
              <HStack spacing={3}>
                <Button
                  leftIcon={<RepeatIcon />}
                  variant="outline"
                  colorScheme="red"
                  onClick={handleReset}
                  isLoading={resetMutation.isPending}
                >
                  Varsayılana Sıfırla
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSave}
                  isLoading={updateMutation.isPending}
                  size="lg"
                >
                  Ayarları Kaydet
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}; 