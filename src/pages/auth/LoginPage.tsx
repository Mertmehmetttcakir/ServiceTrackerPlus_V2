import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; // supabase client importu geri eklendi
// import { useSupabase } from '../../providers/SupabaseProvider'; // Bu hook kaldırılacak
import { useAuth } from '../../context/AuthContext'; // Doğru import yolu

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // const { signIn } = useSupabase(); // Eski kullanım
  const { login, isAuthenticated, isLoading: authIsLoading, user } = useAuth(); // isAuthenticated ve isLoading (authIsLoading olarak yeniden adlandırıldı) eklendi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false); // Buton için ayrı loading state'i
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Giriş başarılı olduğunda ve AuthContext güncellendiğinde yönlendir
  useEffect(() => {
    if (isAuthenticated && !authIsLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authIsLoading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // const { error } = await signIn(email, password); // Eski kullanım
      await login({ email, password }); // Yeni kullanım: AuthContext'teki login fonksiyonu
      // Giriş başarılı olursa AuthContext içindeki onAuthStateChange user state'ini güncelleyecek
      // ve ProtectedRoute yönlendirmeyi doğru yapacak. Burada ayrıca navigate gerekmemeli,
      // çünkü ProtectedRoute kullanıcıyı zaten dashboard'a veya hedeflenen sayfaya yönlendirecektir.
      // Eğer navigate('/dashboard') kalırsa, oturumun güncellenmesini beklemek için bir mekanizma eklenebilir
      // veya ProtectedRoute'un bu yönlendirmeyi yapmasına güvenilebilir.
      // Şimdilik navigate'i kaldırıyorum, AuthContext ve ProtectedRoute'un işini yapmasına izin veriyorum.
      // navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Giriş başarısız',
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setFormLoading(false); // Hata durumunda butonu tekrar aktif et
    }
  };

  const handleGoogleLogin = async () => {
    setFormLoading(true); // Google login sırasında da butonu/formu disable edebiliriz
    try {
      const { error } = await supabase.auth.signInWithOAuth({ // supabase client doğrudan kullanılabilir
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: 'Google ile giriş başarısız',
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false); // Google login denemesi sonrası butonu tekrar aktif et
    }
  };

  const handleRegisterNavigation = () => {
    navigate('/auth/register');
  };

  return (
    <Box minH="100vh" bg="gray.50" py={12} px={{ base: 4, sm: 6, lg: 8 }}>
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading size="xl" color="brand.500">
              ServiceTracker Plus
            </Heading>
            <Text color="gray.600">
              Otomotiv servis yönetim sistemine hoş geldiniz
            </Text>
          </VStack>

          <Box
            w="full"
            bg={bgColor}
            rounded="lg"
            boxShadow="lg"
            p={8}
            borderWidth={1}
            borderColor={borderColor}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id="email" isRequired>
                  <FormLabel>E-posta</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                  />
                </FormControl>

                <FormControl id="password" isRequired>
                  <FormLabel>Şifre</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  fontSize="md"
                  isLoading={formLoading}
                >
                  Giriş Yap
                </Button>
              </Stack>
            </form>

            <HStack my={6} spacing={4}>
              <Divider />
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                veya
              </Text>
              <Divider />
            </HStack>

            <Button
              w="full"
              variant="outline"
              onClick={handleGoogleLogin}
              leftIcon={
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width="20"
                  height="20"
                />
              }
              isLoading={formLoading}
            >
              Google ile Giriş Yap
            </Button>

            <HStack mt={6} justify="center" spacing={4}>
              <Button
                variant="link"
                colorScheme="brand"
                onClick={handleRegisterNavigation}
              >
                Hesap Oluştur
              </Button>
              <Button
                variant="link"
                colorScheme="brand"
                onClick={() => navigate('/auth/reset-password')}
              >
                Şifremi Unuttum
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}; 