import { Reducer } from 'react';
import { ActionsType } from '../types';
import { IState, Payload, Action } from './types';

const reducer: Reducer<IState, ActionsType<Payload>> = (state, action) => {
  if (action.type === Action.FETCH) {
    return {
      ...state,
      dataAvailable: true,
      tenants: action.payload.tenants,
    };
  }
  return state;
};

export default reducer;
