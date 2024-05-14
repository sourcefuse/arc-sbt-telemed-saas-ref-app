import { createContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import axios from '../../utils/axios';
import reducer from './reducer';
import { IState, IContext, Action } from './types';

const initialState: IState = {
  dataAvailable: false,
  categories: [],
};

export const Context = createContext<IContext | null>(null);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchCategories: IContext['fetchCategories'] = useCallback(async () => {
    const response = await axios.get('/categories');

    const { categories } = response.data;

    dispatch({
      type: Action.FETCH,
      payload: {
        categories: categories,
      },
    });
    return categories;
  }, []);

  const addCategory: IContext['addCategory'] = useCallback(async (data) => {
    const response = await axios.post(`/categories`, data);

    const { category } = response.data;
    return category;
  }, []);

  const patchCategory: IContext['patchCategory'] = useCallback(async (id, data) => {
    const response = await axios.patch(`/categories/${id}`, data);

    const { category } = response.data;
    return category;
  }, []);

  const deleteCategory: IContext['deleteCategory'] = useCallback(async (id) => {
    const response = await axios.delete(`/categories/${id}`);

    const { message } = response.data;
    return message;
  }, []);

  const memoizedValue = useMemo<IContext>(
    () => ({
      dataAvailable: state.dataAvailable,
      categories: state.categories,
      fetchCategories,
      patchCategory,
      addCategory,
      deleteCategory,
    }),
    [
      state.categories,
      deleteCategory,
      fetchCategories,
      addCategory,
      patchCategory,
      state.dataAvailable,
    ]
  );

  return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
}
