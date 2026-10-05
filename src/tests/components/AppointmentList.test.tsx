import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAppointments } from '../../__mocks__/appointmentMocks';
import { AppointmentList } from '../../components/features/AppointmentList/AppointmentList';
import { useAppointments } from '../../hooks/useAppointments';

// Mock hooks
vi.mock('../../hooks/useAppointments');
vi.mock('../../hooks/useUserRole', () => ({
  useUserRole: vi.fn(() => ({
    canManageAppointments: true,
    isLoading: false,
  })),
}));

describe('AppointmentList', () => {
  let queryClient: QueryClient;

  const renderComponent = () => {
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
            <AppointmentList />
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Her test için varsayılan bir mock ayarla
    vi.mocked(useAppointments).mockReturnValue({
      appointments: mockAppointments,
      isLoading: false,
      createAppointment: vi.fn(),
      updateAppointment: vi.fn(),
      deleteAppointment: vi.fn(),
      createRecurringAppointments: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isCreatingRecurring: false,
    });
  });

  it('randevu listesi yüklenir', () => {
    renderComponent();
    expect(screen.getByText(/randevular/i)).toBeInTheDocument();
  });

  it('randevular gösterilir', () => {
    renderComponent();
    if (mockAppointments.length > 0) {
      expect(screen.getByText(/Periyodik Bakım/i)).toBeInTheDocument();
    }
  });

  it('yeni randevu ekle butonu gösterilir', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /yeni randevu/i })).toBeInTheDocument();
  });

  it('loading durumunda spinner gösterir', () => {
    // Bu test için mock'u override et
    vi.mocked(useAppointments).mockReturnValue({
      appointments: [],
      isLoading: true,
      createAppointment: vi.fn(),
      updateAppointment: vi.fn(),
      deleteAppointment: vi.fn(),
      createRecurringAppointments: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isCreatingRecurring: false,
    });

    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
}); 