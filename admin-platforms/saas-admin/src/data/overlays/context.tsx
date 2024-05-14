import { createContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import axios from '../../utils/axios';
import { UploadURLResponse } from '../types';
import reducer from './reducer';
import { IState, IContext, Action, OverlayHydrated } from './types';

const initialState: IState = {
  dataAvailable: false,
  overlays: [],
};

export const Context = createContext<IContext | null>(null);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getUploadURL: IContext['getUploadURL'] = useCallback(async (fileName) => {
    const response = await axios.get<UploadURLResponse>('/overlays/upload-url', {
      params: { fileName },
    });

    return response.data;
  }, []);

  const fetchOverlays: IContext['fetchOverlays'] = useCallback(async () => {
    const response = await axios.get<{
      overlays: OverlayHydrated[];
    }>('/overlays/all');

    const { overlays } = response.data;

    dispatch({
      type: Action.FETCH,
      payload: {
        overlays,
      },
    });
    return overlays;
  }, []);

  const addOverlay: IContext['addOverlay'] = useCallback(async (data) => {
    const response = await axios.post('/overlays', data);

    const { overlay } = response.data;

    return overlay;
  }, []);

  const deleteOverlay: IContext['deleteOverlay'] = useCallback(async (id) => {
    const response = await axios.delete(`/overlay/${id}`);

    const { message } = response.data;
    return message;
  }, []);

  const memoizedValue = useMemo<IContext>(
    () => ({
      dataAvailable: state.dataAvailable,
      overlays: state.overlays,
      fetchOverlays,
      addOverlay,
      getUploadURL: getUploadURL,
      deleteOverlay,
    }),
    [state.overlays, fetchOverlays, getUploadURL, addOverlay, deleteOverlay, state.dataAvailable]
  );

  return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
}
