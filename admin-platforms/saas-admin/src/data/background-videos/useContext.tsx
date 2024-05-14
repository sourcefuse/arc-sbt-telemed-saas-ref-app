import { useContext } from 'react';
import { Context } from './context';

export const useHydratedContext = () => {
  const context = useContext(Context);

  if (!context)
    throw new Error('useBackgroundVideos context must be use inside BackgroundVideosProvider');

  return context;
};
