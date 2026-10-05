import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#0967D2',
    600: '#0552B5',
    700: '#03449E',
    800: '#01337D',
    900: '#002159',
  },
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
};

const fonts = {
  heading: 'Inter, sans-serif',
  body: 'Inter, sans-serif',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
        },
      },
      outline: {
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
        },
      },
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },
  FormLabel: {
    baseStyle: {
      fontWeight: 'medium',
      color: 'gray.700',
    },
  },
};

const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
  },
};

export const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
}); 