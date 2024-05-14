import { HydratedEntity, HydratedWithTimestamps, UploadURLResponse } from '../types';

export interface OverlayDry {
  webmPath: string;
  movPath: string;
  duration: number;
  width: number;
  height: number;
}

export type OverlayHydrated = HydratedWithTimestamps<HydratedEntity<OverlayDry>>;

export interface IState {
  dataAvailable: boolean;
  overlays: Array<OverlayHydrated>;
}

export type IContext = IState & {
  fetchOverlays: () => Promise<OverlayHydrated[]>;
  addOverlay: (data: OverlayDry) => Promise<OverlayHydrated>;
  deleteOverlay: (id: OverlayHydrated['_id']) => Promise<string>;
  getUploadURL: (fileName: string) => Promise<UploadURLResponse>;
};

export enum Action {
  FETCH = 'FETCH',
  ADD = 'ADD',
}

export type Payload = {
  [Action.FETCH]: {
    overlays: IState['overlays'];
  };
  [Action.ADD]: OverlayDry;
};
