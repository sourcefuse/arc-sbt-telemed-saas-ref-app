import { Reducer } from 'react';
import { ActionsType } from '../types';
import { IState, Payload, Action } from './types';

const reducer: Reducer<IState, ActionsType<Payload>> = (state, action) => {
  if (action.type === Action.FETCH) {
    return {
      ...state,
      dataAvailable: true,
      fonts: action.payload.fonts,
    };
  } else if (action.type === Action.PATCH) {
    return {
      ...state,
      fonts: state.fonts.map((font) => {
        if (font._id === action.payload.id && action.payload.visible !== undefined) {
          font.visible = action.payload.visible;
        }
        return font;
      }),
    };
  }
  return state;
};

export default reducer;
