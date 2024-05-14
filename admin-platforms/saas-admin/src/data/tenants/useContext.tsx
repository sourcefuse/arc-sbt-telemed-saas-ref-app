import { useContext } from 'react';
import { Context } from './context';

export const useHydratedContext = () => {
  const context = useContext(Context);

  if (!context) throw new Error('useTenants context must be use inside TenantProvider');

  return context;
};
