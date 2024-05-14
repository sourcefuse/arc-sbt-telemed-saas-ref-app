import { createContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import axios from '../../utils/axios';
import { UploadURLResponse } from '../types';
import reducer from './reducer';
import { IState, IContext, Action, BackgroundVideoHydrated } from './types';

const initialState: IState = {
  dataAvailable: false,
  backgroundVideos: [],
};

export const Context = createContext<IContext | null>(null);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getUploadURL: IContext['getUploadURL'] = useCallback(async (fileName) => {
    const response = await axios.get<UploadURLResponse>('/background-videos/upload-url', {
      params: { fileName },
    });

    return response.data;
  }, []);

  const fetchBackgroundVideos: IContext['fetchBackgroundVideos'] = useCallback(async () => {
    const response = await axios.get<{
      backgroundVideos: BackgroundVideoHydrated[];
    }>('/background-videos');

    const { backgroundVideos } = response.data;

    dispatch({
      type: Action.FETCH,
      payload: {
        backgroundVideos,
      },
    });
    return backgroundVideos;
  }, []);

  const addBackgroundVideo: IContext['addBackgroundVideo'] = useCallback(async (data) => {
    const response = await axios.post('/background-videos', data);

    const { backgroundVideo } = response.data;

    return backgroundVideo;
  }, []);

  const deleteBackgroundVideo: IContext['deleteBackgroundVideo'] = useCallback(async (id) => {
    const response = await axios.delete(`/background-videos/${id}`);

    const { message } = response.data;
    return message;
  }, []);

  const memoizedValue = useMemo<IContext>(
    () => ({
      dataAvailable: state.dataAvailable,
      backgroundVideos: state.backgroundVideos,
      fetchBackgroundVideos,
      addBackgroundVideo,
      getUploadURL: getUploadURL,
      deleteBackgroundVideo,
    }),
    [
      state.backgroundVideos,
      fetchBackgroundVideos,
      getUploadURL,
      addBackgroundVideo,
      deleteBackgroundVideo,
      state.dataAvailable,
    ]
  );

  return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
}
