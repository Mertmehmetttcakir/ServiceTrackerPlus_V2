import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Link as ChakraLink,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RegisterRequest } from '../../types/auth';

export const RegisterForm: React.FC = () => {
  const initialFormValues: RegisterRequest = {
    username: '',
    password: '',
    name: '',
    email: '',
  };

  const [formValues, setFormValues] = useState<RegisterRequest>(initialFormValues);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.username.trim()) {
      errors.username = 'Kullanıcı adı gereklidir';
    } else if (formValues.username.length < 3) {
      errors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    if (!formValues.name.trim()) {
      errors.name = 'Ad Soyad gereklidir';
    }

    if (!formValues.email.trim()) {
      errors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formValues.password) {
      errors.password = 'Şifre gereklidir';
    } else if (formValues.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    // Eğer o alan için bir hata varsa temizle
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await register(formValues);
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 2 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Box
      p={8}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      bg={bgColor}
      borderColor={borderColor}
      maxW="480px"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg">Kayıt Ol</Heading>
          <Text mt={2} fontSize="md" color="gray.500">
            ServiceTracker Plus sistemine kayıt olun
          </Text>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {success && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!formErrors.username} isRequired>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <Input
                name="username"
                value={formValues.username}
                onChange={handleInputChange}
                placeholder="Kullanıcı adınızı girin"
              />
              {formErrors.username && (
                <FormErrorMessage>{formErrors.username}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.name} isRequired>
              <FormLabel>Ad Soyad</FormLabel>
              <Input
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="Ad ve soyadınızı girin"
              />
              {formErrors.name && (
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.email} isRequired>
              <FormLabel>E-posta</FormLabel>
              <Input
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleInputChange}
                placeholder="E-posta adresinizi girin"
              />
              {formErrors.email && (
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.password} isRequired>
              <FormLabel>Şifre</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formValues.password}
                  onChange={handleInputChange}
                  placeholder="Şifrenizi girin"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={togglePasswordVisibility}
                  />
                </InputRightElement>
              </InputGroup>
              {formErrors.password && (
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isLoading}
              mt={4}
              w="100%"
            >
              Kayıt Ol
            </Button>
          </VStack>
        </form>

        <Box textAlign="center">
          <Text fontSize="sm">
            Zaten hesabınız var mı?{' '}
            <ChakraLink as={Link} to="/login" color="blue.500">
              Giriş Yap
            </ChakraLink>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}; 