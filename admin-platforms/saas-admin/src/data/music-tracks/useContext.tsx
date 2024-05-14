import { useContext } from 'react';
import { Context } from './context';

export const useHydratedContext = () => {
  const context = useContext(Context);

  if (!context) throw new Error('useMusicTracks context must be use inside MusicTracksProvider');

  return context;
};
