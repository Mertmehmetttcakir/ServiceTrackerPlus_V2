import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e6f1ff',
    100: '#bdd4ff',
    200: '#94b7ff',
    300: '#6b9aff',
    400: '#427dff',
    500: '#2961ff', // Ana marka rengi
    600: '#1d4bd9',
    700: '#1437b3',
    800: '#0a248c',
    900: '#031166',
  },
};

const fonts = {
  heading: '"Poppins", sans-serif',
  body: '"Inter", sans-serif',
};

const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : `${props.colorScheme}.600`,
        },
      }),
      outline: (props: any) => ({
        border: '1px solid',
        borderColor: props.colorScheme === 'brand' ? 'brand.500' : `${props.colorScheme}.500`,
        color: props.colorScheme === 'brand' ? 'brand.500' : `${props.colorScheme}.500`,
      }),
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'gray.200',
          backgroundColor: 'gray.50',
          fontWeight: 'semibold',
          fontSize: 'sm',
        },
        td: {
          borderColor: 'gray.100',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      p: 4,
      borderRadius: 'lg',
      boxShadow: 'sm',
      bg: 'white',
    },
  },
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
}); 