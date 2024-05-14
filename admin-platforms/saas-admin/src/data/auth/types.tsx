import { AuthSession, AuthUser } from 'aws-amplify/auth';

export type AuthUserType = null | AuthUser;

export type IState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  session?: AuthSession;
};

export type IContext = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  session: IState['session'];
  // login: (email: string, password: string) => Promise<void>;
  // register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
};

export enum Action {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

export type Payload = {
  [Action.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
    session: IState['session'];
  };
  [Action.LOGIN]: {
    user: AuthUserType;
  };
  [Action.REGISTER]: {
    user: AuthUserType;
  };
  [Action.LOGOUT]: undefined;
};
