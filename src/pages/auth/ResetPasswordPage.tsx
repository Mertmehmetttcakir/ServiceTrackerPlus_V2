import {
  Alert,
  AlertIcon,
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Şifre sıfırlama işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxW="md" centerContent height="100vh" justifyContent="center">
        <VStack spacing={6} width="full" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
          <Heading textAlign="center" size="xl" color="gray.700">
            E-posta Gönderildi
          </Heading>
          <Text textAlign="center" color="gray.600">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.
          </Text>
          <Button 
            colorScheme="blue" 
            variant="outline" 
            onClick={() => navigate('/auth/login')}
            width="full"
          >
            Giriş sayfasına dön
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="md" centerContent height="100vh" justifyContent="center">
      <VStack 
        as="form" 
        onSubmit={handleResetPassword} 
        spacing={6} 
        width="full" 
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg" 
        bg="white"
      >
        <Heading textAlign="center" size="xl" color="gray.700">
          Şifrenizi mi unuttunuz?
        </Heading>
        <Text textAlign="center" color="gray.600">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </Text>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <FormControl isRequired>
          <FormLabel>E-posta adresi</FormLabel>
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresinizi girin"
            size="lg"
          />
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue" 
          width="full" 
          size="lg"
          isLoading={loading}
        >
          Şifre Sıfırlama Bağlantısı Gönder
        </Button>

        <Center width="full">
          <Button 
            variant="link" 
            colorScheme="blue" 
            onClick={() => navigate('/auth/login')}
          >
            Giriş sayfasına dön
          </Button>
        </Center>
      </VStack>
    </Container>
  );
}; 