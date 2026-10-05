import {
    Alert,
    AlertIcon,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    useToast,
    VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const UpdatePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      toast({
        title: 'Hata',
        description: 'Girilen şifreler eşleşmiyor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      toast({
        title: 'Başarılı',
        description: 'Şifreniz başarıyla güncellendi. Lütfen yeni şifrenizle giriş yapın.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/auth/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Şifre güncellenirken bir hata oluştu';
      setError(errorMessage);
      toast({
        title: 'Şifre Güncelleme Hatası',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" centerContent height="100vh" justifyContent="center">
      <VStack 
        as="form" 
        onSubmit={handleUpdatePassword} 
        spacing={6} 
        width="full" 
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg" 
        bg="white"
      >
        <Heading textAlign="center" size="xl" color="gray.700">
          Yeni Şifre Belirle
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <FormControl isRequired>
          <FormLabel htmlFor="password">Yeni Şifre</FormLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Yeni Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="confirmPassword">Yeni Şifre (Tekrar)</FormLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Yeni Şifre (Tekrar)"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue"
          width="full" 
          size="lg"
          isLoading={loading}
        >
          Şifreyi Güncelle
        </Button>

        <Stack pt={6} direction="row" spacing={4} alignSelf="center">
            <Text align="center">
              Giriş sayfasına dönmek için?{' '}
              <Button 
                variant="link" 
                colorScheme="blue"
                onClick={() => navigate('/auth/login')}
              >
                Giriş Yap
              </Button>
            </Text>
        </Stack>
      </VStack>
    </Container>
  );
}; 