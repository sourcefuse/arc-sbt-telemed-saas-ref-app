import { Reducer } from 'react';
import { ActionsType } from '../types';
import { IState, Payload, Action } from './types';

const reducer: Reducer<IState, ActionsType<Payload>> = (state, action) => {
  if (action.type === Action.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
      session: action.payload.session,
    };
  }
  /* if (action.type === Action.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Action.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  } */
  if (action.type === Action.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
      session: undefined,
    };
  }
  return state;
};

export default reducer;
