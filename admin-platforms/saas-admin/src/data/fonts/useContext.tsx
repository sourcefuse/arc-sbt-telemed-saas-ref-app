import { useContext } from 'react';
import { Context } from './context';

export const useHydratedContext = () => {
  const context = useContext(Context);

  if (!context) throw new Error('useFonts context must be use inside FontsProvider');

  return context;
};
