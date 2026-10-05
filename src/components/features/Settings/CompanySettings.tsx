import { DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import {
    Alert,
    AlertIcon,
    Avatar,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Input,
    Select,
    Spinner,
    Text,
    Textarea,
    useToast,
    VStack
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import {
    useCompanyProfile,
    useCreateCompanyProfile,
    useDeleteLogo,
    useUpdateCompanyProfile,
    useUploadLogo
} from '../../../hooks/useCompany';
import { CompanyCreate, CompanyUpdate } from '../../../types/company';

export const CompanySettings: React.FC = () => {
  const { data: company, isLoading, error } = useCompanyProfile();
  const createMutation = useCreateCompanyProfile();
  const updateMutation = useUpdateCompanyProfile();
  const uploadLogoMutation = useUploadLogo();
  const deleteLogoMutation = useDeleteLogo();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [formData, setFormData] = useState<CompanyCreate>({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Türkiye',
    tax_number: '',
    website: '',
    working_hours: {
      monday: { start: '09:00', end: '18:00', closed: false },
      tuesday: { start: '09:00', end: '18:00', closed: false },
      wednesday: { start: '09:00', end: '18:00', closed: false },
      thursday: { start: '09:00', end: '18:00', closed: false },
      friday: { start: '09:00', end: '18:00', closed: false },
      saturday: { start: '09:00', end: '17:00', closed: false },
      sunday: { start: '10:00', end: '16:00', closed: true },
    },
  });

  // Şirket verisi yüklendiğinde form verilerini güncelle
  React.useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        postal_code: company.postal_code || '',
        country: company.country || 'Türkiye',
        tax_number: company.tax_number || '',
        website: company.website || '',
        working_hours: company.working_hours || {
          monday: { start: '09:00', end: '18:00', closed: false },
          tuesday: { start: '09:00', end: '18:00', closed: false },
          wednesday: { start: '09:00', end: '18:00', closed: false },
          thursday: { start: '09:00', end: '18:00', closed: false },
          friday: { start: '09:00', end: '18:00', closed: false },
          saturday: { start: '09:00', end: '17:00', closed: false },
          sunday: { start: '10:00', end: '16:00', closed: true },
        },
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (company) {
        // Güncelleme
        const updateData: CompanyUpdate = { ...formData };
        await updateMutation.mutateAsync(updateData);
      } else {
        // Oluşturma
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      // Hata toast'u hook'lar tarafından gösterilir
    }
  };

  const handleInputChange = (field: keyof CompanyCreate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkingHoursChange = (
    day: keyof NonNullable<CompanyCreate['working_hours']>,
    field: 'start' | 'end' | 'closed',
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours?.[day],
          [field]: value,
        },
      },
    }));
  };

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Hata',
        description: 'Sadece resim dosyaları yüklenebilir',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Hata',
        description: 'Dosya boyutu 5MB\'dan küçük olmalıdır',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await uploadLogoMutation.mutateAsync(file);
    } catch (error) {
      // Hata toast'u hook tarafından gösterilir
    }

    // Input'u temizle
    e.target.value = '';
  };

  const handleDeleteLogo = async () => {
    if (window.confirm('Logoyu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteLogoMutation.mutateAsync();
      } catch (error) {
        // Hata toast'u hook tarafından gösterilir
      }
    }
  };

  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      monday: 'Pazartesi',
      tuesday: 'Salı',
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi',
      sunday: 'Pazar',
    };
    return days[day] || day;
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Şirket bilgileri yüklenirken bir hata oluştu: {error.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Şirket Bilgileri</Heading>

        {/* Logo Yönetimi */}
        <Card>
          <CardHeader>
            <Heading size="md">Şirket Logosu</Heading>
          </CardHeader>
          <CardBody>
            <Flex align="center" gap={4}>
              <Avatar 
                size="xl" 
                src={company?.logo_url || undefined} 
                name={company?.name || 'Şirket'} 
              />
              <VStack align="start">
                <HStack>
                  <Button 
                    onClick={handleLogoUpload}
                    isLoading={uploadLogoMutation.isPending}
                    colorScheme="blue"
                    size="sm"
                  >
                    Logo Yükle
                  </Button>
                  {company?.logo_url && (
                    <IconButton
                      aria-label="Logoyu Sil"
                      icon={<DeleteIcon />}
                      onClick={handleDeleteLogo}
                      isLoading={deleteLogoMutation.isPending}
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                    />
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  PNG, JPG veya JPEG formatında, maksimum 5MB
                </Text>
              </VStack>
            </Flex>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </CardBody>
        </Card>

        {/* Genel Bilgiler */}
        <Card>
          <CardHeader>
            <Heading size="md">Genel Bilgiler</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>Şirket Adı</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Şirket adını giriniz"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>E-posta</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@sirket.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefon</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+90 (555) 123 45 67"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.sirket.com"
                  />
                </FormControl>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>Açıklama</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Şirket açıklaması"
                      rows={3}
                    />
                  </FormControl>
                </GridItem>

                <FormControl isRequired>
                  <FormLabel>Adres</FormLabel>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Tam adres"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Şehir</FormLabel>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="İstanbul"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Posta Kodu</FormLabel>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="34000"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Ülke</FormLabel>
                  <Select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    <option value="Türkiye">Türkiye</option>
                    <option value="KKTC">KKTC</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Vergi Numarası</FormLabel>
                  <Input
                    value={formData.tax_number}
                    onChange={(e) => handleInputChange('tax_number', e.target.value)}
                    placeholder="1234567890"
                  />
                </FormControl>
              </Grid>
            </form>
          </CardBody>
        </Card>

        {/* Çalışma Saatleri */}
        <Card>
          <CardHeader>
            <Heading size="md">Çalışma Saatleri</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              {Object.entries(formData.working_hours || {}).map(([day, hours]) => (
                <Grid key={day} templateColumns="1fr 1fr 1fr auto" gap={4} w="full" alignItems="center">
                  <Text fontWeight="medium" minW="100px">
                    {getDayName(day)}
                  </Text>
                  <Input
                    type="time"
                    value={hours.start}
                    onChange={(e) => handleWorkingHoursChange(day as any, 'start', e.target.value)}
                    isDisabled={hours.closed}
                    size="sm"
                  />
                  <Input
                    type="time"
                    value={hours.end}
                    onChange={(e) => handleWorkingHoursChange(day as any, 'end', e.target.value)}
                    isDisabled={hours.closed}
                    size="sm"
                  />
                  <Button
                    size="sm"
                    variant={hours.closed ? 'solid' : 'outline'}
                    colorScheme={hours.closed ? 'red' : 'gray'}
                    onClick={() => handleWorkingHoursChange(day as any, 'closed', !hours.closed)}
                  >
                    {hours.closed ? 'Kapalı' : 'Açık'}
                  </Button>
                </Grid>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Kaydet Butonu */}
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <HStack>
                <InfoIcon color="blue.500" />
                <Text color="gray.600">
                  {company ? 'Değişiklikleri kaydetmek için güncelleyin' : 'Şirket profili oluşturmak için kaydedin'}
                </Text>
              </HStack>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                size="lg"
              >
                {company ? 'Güncelle' : 'Kaydet'}
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}; 