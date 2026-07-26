import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, hasRole } from '@/contexts/AuthContext';
import type { Role } from '@/types';
import { FullSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RoleRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(user, ...roles)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function RootRedirect() {
  const { user } = useAuth();
  if (user === undefined) return <FullSpinner />;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
