import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login({ username, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Box
        py="8"
        px={{ base: '4', sm: '10' }}
        bg={bgColor}
        boxShadow="lg"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing="6">
          <Heading size="lg">ServiceTracker Plus</Heading>
          <VStack as="form" spacing="6" w="100%" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Şifre</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              fontSize="md"
              width="full"
              isLoading={isLoading}
            >
              Giriş Yap
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Container>
  );
}; 