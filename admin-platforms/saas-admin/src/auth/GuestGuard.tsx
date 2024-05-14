import { useEffect } from 'react';
// next
import { useRouter } from 'next/router';
// components
import LoadingScreen from '../components/loading-screen';
//
import { useAuth } from '../data/auth';
import { ROOTS_DASHBOARD } from 'src/routes/paths';

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: React.ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { push } = useRouter();

  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      push(ROOTS_DASHBOARD);
    }
  }, [isAuthenticated]);

  if (isInitialized === isAuthenticated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
