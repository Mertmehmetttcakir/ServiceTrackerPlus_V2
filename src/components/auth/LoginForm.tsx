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

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [formValues, setFormValues] = useState<LoginFormValues>({ 
    username: '', 
    password: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formValues);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const isUsernameInvalid = formValues.username.trim() === '';
  const isPasswordInvalid = formValues.password.trim() === '';

  return (
    <Box 
      p={8} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="lg"
      bg={bgColor}
      borderColor={borderColor}
      maxW="400px"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg">ServiceTracker Plus</Heading>
          <Text mt={2} fontSize="md" color="gray.500">
            Otomotiv servis yönetim sistemi
          </Text>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={isUsernameInvalid} isRequired>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <Input
                name="username"
                value={formValues.username}
                onChange={handleInputChange}
                placeholder="Kullanıcı adınızı girin"
                autoComplete="username"
              />
              {isUsernameInvalid && (
                <FormErrorMessage>Kullanıcı adı gereklidir</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={isPasswordInvalid} isRequired>
              <FormLabel>Şifre</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formValues.password}
                  onChange={handleInputChange}
                  placeholder="Şifrenizi girin"
                  autoComplete="current-password"
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
              {isPasswordInvalid && (
                <FormErrorMessage>Şifre gereklidir</FormErrorMessage>
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
              Giriş Yap
            </Button>
          </VStack>
        </form>

        <Box textAlign="center">
          <Text fontSize="sm">
            Henüz hesabınız yok mu?{' '}
            <ChakraLink as={Link} to="/register" color="blue.500">
              Kayıt Ol
            </ChakraLink>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}; 