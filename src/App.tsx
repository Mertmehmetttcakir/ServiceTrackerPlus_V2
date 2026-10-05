import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { ErrorInfo, lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AutoBackupManager } from './components/common/AutoBackupManager';
import { CacheDebugButton } from './components/common/CacheDebugButton';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layouts/MainLayout';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './context/AuthContext';
import { Sentry } from './lib/sentry';
import { theme } from './theme';

// Sayfaları lazy-load ile parçalı yükle
const DashboardPage = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })),
);

const CustomerListPage = lazy(() => import('./pages/customers/CustomerList'));

const CustomerDetailsPage = lazy(() =>
  import('./pages/customers/CustomerDetailsPage').then((m) => ({
    default: m.CustomerDetailsPage,
  })),
);

const AppointmentsListPage = lazy(() =>
  import('./pages/appointments/AppointmentsListPage').then((m) => ({
    default: m.AppointmentsListPage,
  })),
);

const AppointmentCalendarPage = lazy(() => import('./pages/appointments/AppointmentCalendar'));

const JobDetailsPage = lazy(() =>
  import('./pages/jobs/JobDetailsPage').then((m) => ({ default: m.JobDetailsPage })),
);

const ServiceHistoryPage = lazy(() =>
  import('./pages/services/ServiceHistory').then((m) => ({ default: m.default })),
);

const ReportsPage = lazy(() =>
  import('./pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);

const FinanceDashboardPage = lazy(() =>
  import('./pages/finance/FinanceDashboard').then((m) => ({ default: m.FinanceDashboard })),
);

const SupplierListPage = lazy(() =>
  import('./pages/suppliers/SupplierList').then((m) => ({ default: m.SupplierList })),
);

const SupplierDetailsPage = lazy(() =>
  import('./pages/suppliers/SupplierDetails').then((m) => ({ default: m.SupplierDetails })),
);

const CompanySettingsPage = lazy(() =>
  import('./pages/admin/CompanySettingsPage').then((m) => ({
    default: m.CompanySettingsPage,
  })),
);

const SystemSettingsPage = lazy(() =>
  import('./pages/admin/SystemSettingsPage').then((m) => ({
    default: m.SystemSettingsPage,
  })),
);

const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);

const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);

const ResetPasswordPage = lazy(() =>
  import('./pages/auth/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

const UpdatePasswordPage = lazy(() =>
  import('./pages/auth/UpdatePasswordPage').then((m) => ({
    default: m.UpdatePasswordPage,
  })),
);

const AuthCallbackPage = lazy(() =>
  import('./pages/auth/AuthCallback').then((m) => ({ default: m.AuthCallback })),
);

const ProfilePage = lazy(() =>
  import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);

const TechnicianListPage = lazy(() =>
  import('./pages/technicians/TechnicianList').then((m) => ({ default: m.default })),
);

// Hata Sınırı Bileşeni
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Yakalanan Hata:', error, errorInfo);
    const nodeEnv =
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) ||
      ((typeof import.meta !== 'undefined' &&
        (import.meta as any).env &&
        ((import.meta as any).env.MODE as string)) ??
        'production');
    const isProd = nodeEnv === 'production';
    const isTestMode =
      (typeof process !== 'undefined' &&
        process.env &&
        process.env.REACT_APP_ENABLE_SENTRY_TEST === 'true') ||
      (typeof import.meta !== 'undefined' &&
        (import.meta as any).env &&
        (import.meta as any).env.VITE_ENABLE_SENTRY_TEST === 'true');
    if (isProd || isTestMode) {
      Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Bir Hata Oluştu</h1>
          <p>Üzgünüz, beklenmedik bir hata meydana geldi.</p>
          <pre style={{color: 'red', marginTop: '20px'}}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <AutoBackupManager />
              <CacheDebugButton />
              <Suspense fallback={<div>Yükleniyor...</div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/register" element={<RegisterPage />} />
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/customers" element={<CustomerListPage />} />
                      <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                      <Route path="/appointments" element={<AppointmentsListPage />} />
                      <Route path="/appointments/calendar" element={<AppointmentCalendarPage />} />
                      <Route path="/appointments/:id" element={<div>Randevu Detay</div>} />
                      <Route path="/jobs/:id" element={<JobDetailsPage />} />
                      <Route path="/vehicles" element={<div>Araçlar</div>} />
                      <Route path="/technicians" element={<TechnicianListPage />} />
                      <Route path="/services" element={<ServiceHistoryPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/finance" element={<FinanceDashboardPage />} />
                      <Route path="/suppliers" element={<SupplierListPage />} />
                      <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
                    </Route>
                  </Route>
                  
                  {/* Admin only routes */}
                  <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
                    <Route element={<MainLayout />}>
                      <Route path="/admin/company" element={<CompanySettingsPage />} />
                      <Route path="/admin/settings" element={<SystemSettingsPage />} />
                    </Route>
                  </Route>
                  
                  {/* Default redirects */}
                  <Route path="*" element={<div>Sayfa Bulunamadı</div>} />
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
};
