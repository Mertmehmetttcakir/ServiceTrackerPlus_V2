import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockCustomers } from '../../__mocks__/customerMocks';
import { CustomerDetails } from '../../components/features/CustomerDetails/CustomerDetails';
import { useCustomer } from '../../hooks/useCustomer';

// Mock hooks
vi.mock('../../hooks/useCustomer');

describe('CustomerDetails', () => {
  let queryClient: QueryClient;

  const renderComponent = (customerId: string = '1') => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <BrowserRouter>
            <CustomerDetails customerId={customerId} />
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loading durumunda spinner gösterir', () => {
    vi.mocked(useCustomer).mockReturnValue({
      customer: undefined,
      isLoading: true,
      error: null,
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
      isUpdating: false,
      isDeleting: false,
    });

    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('müşteri bilgilerini gösterir', () => {
    const customer = mockCustomers[0];
    vi.mocked(useCustomer).mockReturnValue({
      customer,
      isLoading: false,
      error: null,
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
      isUpdating: false,
      isDeleting: false,
    });

    renderComponent();
    expect(screen.getByText(customer.full_name)).toBeInTheDocument();
    expect(screen.getByText(customer.phone || '')).toBeInTheDocument();
    if (customer.email) {
      expect(screen.getByText(customer.email)).toBeInTheDocument();
    }
  });

  it('hata durumunda hata mesajı gösterir', () => {
    vi.mocked(useCustomer).mockReturnValue({
      customer: undefined,
      isLoading: false,
      error: new Error('Test error'),
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
      isUpdating: false,
      isDeleting: false,
    });

    renderComponent();
    expect(screen.getByText(/hata oluştu/i)).toBeInTheDocument();
  });

  it('düzenle butonuna tıklandığında form açılır', async () => {
    const customer = mockCustomers[0];
    vi.mocked(useCustomer).mockReturnValue({
      customer,
      isLoading: false,
      error: null,
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
      isUpdating: false,
      isDeleting: false,
    });

    renderComponent();
    
    const editButton = screen.getByRole('button', { name: /düzenle/i });
    await userEvent.click(editButton);
    
    expect(screen.getByText(/müşteri düzenle/i)).toBeInTheDocument();
  });

  it('sil butonuna tıklandığında onay dialogu açılır', async () => {
    const customer = mockCustomers[0];
    vi.mocked(useCustomer).mockReturnValue({
      customer,
      isLoading: false,
      error: null,
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
      isUpdating: false,
      isDeleting: false,
    });

    renderComponent();
    
    const deleteButton = screen.getByRole('button', { name: /sil/i });
    await userEvent.click(deleteButton);
    
    expect(screen.getByText(/müşteri sil/i)).toBeInTheDocument();
  });
}); 