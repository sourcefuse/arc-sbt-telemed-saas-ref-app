import { createContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import axios from '../../utils/axios';
import reducer from './reducer';
import { IState, IContext, Action } from './types';

const initialState: IState = {
  dataAvailable: false,
  fonts: [],
};

export const Context = createContext<IContext | null>(null);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchFonts: IContext['fetchFonts'] = useCallback(async () => {
    const response = await axios.get('/fonts/all');

    const { fonts } = response.data;

    dispatch({
      type: Action.FETCH,
      payload: {
        fonts: fonts,
      },
    });
    return fonts;
  }, []);

  const patchFont: IContext['patchFont'] = useCallback(async (id, data) => {
    const response = await axios.patch(`/fonts/${id}`, data);

    const { font } = response.data;
    dispatch({
      type: Action.PATCH,
      payload: {
        id: id,
        visible: data.visible,
      },
    });
    return font;
  }, []);

  const memoizedValue = useMemo<IContext>(
    () => ({
      dataAvailable: state.dataAvailable,
      fonts: state.fonts,
      fetchFonts: fetchFonts,
      patchFont,
    }),
    [state.fonts, fetchFonts, patchFont, state.dataAvailable]
  );

  return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
}
