import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Login } from '../../components/auth/Login';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// useAuth hook'unu mock'la
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('Login Component', () => {
  const queryClient = new QueryClient();
  let mockLogin: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn();
    // Her test için varsayılan mock değerini ayarla
    (useAuth as Mock).mockReturnValue({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  const renderLogin = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('login formunu doğru şekilde render eder', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('form gönderildiğinde login fonksiyonunu çağırır', async () => {
    mockLogin.mockResolvedValueOnce({ id: '1', name: 'Test User' });
    renderLogin();
    
    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('boş alanlar için validasyon hatası gösterir', async () => {
    // Chakra UI'nin Form-Control'ü `isRequired` olduğunda,
    // HTML5 validasyonu devreye girer. `toBeInvalid` ile kontrol edebiliriz.
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
      expect(usernameInput).toBeInvalid();
    });
  });
}); 