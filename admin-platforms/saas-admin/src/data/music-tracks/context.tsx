import { createContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import axios from '../../utils/axios';
import { UploadURLResponse } from '../types';
import genres from './genres';
import reducer from './reducer';
import { IState, IContext, Action, MusicTrackHydrated } from './types';

const initialState: IState = {
  dataAvailable: false,
  musicTracks: [],
  allGenres: genres,
};

export const Context = createContext<IContext | null>(null);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getUploadURL: IContext['getUploadURL'] = useCallback(async (fileName) => {
    const response = await axios.get<UploadURLResponse>('/music-tracks/upload-url', {
      params: { fileName },
    });

    return response.data;
  }, []);

  const fetchMusicTracks: IContext['fetchMusicTracks'] = useCallback(async () => {
    const response = await axios.get<{
      musicTracks: MusicTrackHydrated[];
    }>('/music-tracks');

    const { musicTracks } = response.data;

    dispatch({
      type: Action.FETCH,
      payload: {
        musicTracks,
      },
    });
    return musicTracks;
  }, []);

  const addMusicTrack: IContext['addMusicTrack'] = useCallback(async (data) => {
    const response = await axios.post('/music-tracks', data);

    const { musicTrack } = response.data;

    return musicTrack;
  }, []);

  const deleteMusicTrack: IContext['deleteMusicTrack'] = useCallback(async (id) => {
    const response = await axios.delete(`/music-tracks/${id}`);

    const { message } = response.data;
    return message;
  }, []);

  const memoizedValue = useMemo<IContext>(
    () => ({
      dataAvailable: state.dataAvailable,
      musicTracks: state.musicTracks,
      fetchMusicTracks: fetchMusicTracks,
      allGenres: state.allGenres,
      addMusicTrack: addMusicTrack,
      getUploadURL: getUploadURL,
      deleteMusicTrack: deleteMusicTrack,
    }),
    [
      state.musicTracks,
      fetchMusicTracks,
      getUploadURL,
      addMusicTrack,
      deleteMusicTrack,
      state.dataAvailable,
      state.allGenres,
    ]
  );

  return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
}
