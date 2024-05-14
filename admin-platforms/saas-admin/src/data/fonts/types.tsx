import { HydratedEntity, PatchPayload } from '../types';

export interface FontDry {
  family: string;
  visible: boolean;
}

export type FontUpdateDto = Omit<FontDry, 'family'>;

export type FontHydrated = HydratedEntity<FontDry>;

export interface IState {
  dataAvailable: boolean;
  fonts: Array<FontHydrated>;
}

export type IContext = IState & {
  fetchFonts: () => Promise<FontHydrated[]>;
  patchFont: (id: string, data: FontUpdateDto) => Promise<FontHydrated>;
};

export enum Action {
  FETCH = 'FETCH',
  PATCH = 'PATCH',
}

export type Payload = {
  [Action.FETCH]: {
    fonts: IState['fonts'];
  };
  [Action.PATCH]: PatchPayload<FontUpdateDto>;
};
