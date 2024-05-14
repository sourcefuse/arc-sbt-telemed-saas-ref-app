import { createContext, useReducer, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { setAxiosAuthToken } from 'src/auth/utils';
import localStorageAvailable from 'src/utils/localStorageAvailable';
import reducer from './reducer';
import { IState, IContext, Action } from './types';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

const initialState: IState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  session: undefined,
};

export const Context = createContext<IContext | null>(null);

export function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const storageAvailable = localStorageAvailable();

  const initialize = useCallback(async () => {
    try {
      const authSession = await fetchAuthSession();
      console.log(authSession);
      const idToken = authSession?.tokens?.idToken?.toString();
      if (idToken) {
        setAxiosAuthToken(idToken);

        const currentUser = await getCurrentUser();

        dispatch({
          type: Action.INITIAL,
          payload: {
            isAuthenticated: true,
            user: currentUser,
            session: authSession,
          },
        });
      } else {
        dispatch({
          type: Action.INITIAL,
          payload: {
            isAuthenticated: false,
            user: null,
            session: undefined,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: Action.INITIAL,
        payload: {
          isAuthenticated: false,
          user: null,
          session: undefined,
        },
      });
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  /* const login = useCallback(async (email: string, password: string) => {
    const response = await axios.post('/auth/admin-login', {
      email,
      password,
    });
    const { accessToken, user } = response.data;

    setSession(accessToken);

    dispatch({
      type: Action.LOGIN,
      payload: {
        user,
      },
    });
  }, []);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const response = await axios.post('/api/account/register', {
        email,
        password,
        firstName,
        lastName,
      });
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);

      dispatch({
        type: Action.REGISTER,
        payload: {
          user,
        },
      });
    },
    []
  ); */

  // LOGOUT
  const logout = useCallback(() => {
    signOut();
    setAxiosAuthToken(null);
    dispatch({
      type: Action.LOGOUT,
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      session: state.session,
      // login,
      // register,
      logout,
    }),
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      state.session,
      logout /*  login, register */,
    ]
  );

  if (!state.isInitialized) {
    return <LoadingScreen />;
  }

  return <Context.Provider value={memoizedValue}>{children}</Context.Provider>;
}
