import { createContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import axios from '../../utils/axios';
import reducer from './reducer';
import { IState, IContext, Action, AccountStatuses } from './types';

const initialState: IState = {
  dataAvailable: false,
  tenants: [],
};

export const Context = createContext<IContext | null>(null);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTenants: IContext['fetchTenants'] = useCallback(async () => {
    const response = await axios.get('/tenants');
    const { data } = response.data;

    dispatch({
      type: Action.FETCH,
      payload: {
        tenants: data,
      },
    });
  }, []);

  const fetchTenant: IContext['fetchTenant'] = useCallback(async (id) => {
    const response = await axios.get(`/tenants/${id}`);

    const { data } = response.data;
    return data;
  }, []);

  const patchTenant: IContext['patchTenant'] = useCallback(async (id, data) => {
    const response = await axios.patch(`/tenants/${id}`, data);

    const { user } = response.data;
    return user;
  }, []);

  const createTenant: IContext['createTenant'] = useCallback(async (newTenantData) => {
    const response = await axios.post(`/tenants`, {
      ...newTenantData,
      tenantStatus: AccountStatuses.IN_PROGRESS,
    });

    const { data } = response.data;
    return data;
  }, []);

  const deleteTenant: IContext['deleteTenant'] = useCallback(async (id) => {
    const response = await axios.delete(`/tenants/${id}`);

    const { message } = response.data;
    return message;
  }, []);

  const memoizedValue = useMemo(
    () =>
      ({
        dataAvailable: state.dataAvailable,
        tenants: state.tenants,
        fetchTenants,
        fetchTenant,
        patchTenant,
        createTenant,
        deleteTenant,
      } as IContext),
    [state.tenants, fetchTenants, fetchTenant]
  );

  return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
}
