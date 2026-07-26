import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ProtectedRoute, RoleRoute } from '@/components/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import DoadoresPage from '@/pages/DoadoresPage';
import BeneficiariosPage from '@/pages/BeneficiariosPage';
import DoacoesPage from '@/pages/DoacoesPage';
import SolicitacoesPage from '@/pages/SolicitacoesPage';
import OperadoresPage from '@/pages/OperadoresPage';
import AdminsPage from '@/pages/AdminsPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/doadores" element={<DoadoresPage />} />
              <Route path="/beneficiarios" element={<BeneficiariosPage />} />
              <Route path="/doacoes" element={<DoacoesPage />} />
              <Route path="/solicitacoes" element={<SolicitacoesPage />} />
              <Route
                path="/operadores"
                element={
                  <RoleRoute roles={['ROLE_ADMIN']}>
                    <OperadoresPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admins"
                element={
                  <RoleRoute roles={['ROLE_ADMIN']}>
                    <AdminsPage />
                  </RoleRoute>
                }
              />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
