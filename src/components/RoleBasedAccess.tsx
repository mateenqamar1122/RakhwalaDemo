import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: ('buyer' | 'seller')[];
  fallback?: ReactNode;
}

const RoleBasedAccess = ({ children, allowedRoles, fallback }: RoleBasedAccessProps) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(profile.current_role)) {
    return fallback || <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedAccess;
