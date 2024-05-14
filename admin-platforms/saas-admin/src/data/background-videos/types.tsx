import { HydratedEntity, HydratedWithTimestamps, UploadURLResponse } from '../types';

export interface BackgroundVideoDry {
  path: string;
  duration: number;
  width: number;
  height: number;
}

export type BackgroundVideoHydrated = HydratedWithTimestamps<HydratedEntity<BackgroundVideoDry>>;

export interface IState {
  dataAvailable: boolean;
  backgroundVideos: Array<BackgroundVideoHydrated>;
}

export type IContext = IState & {
  fetchBackgroundVideos: () => Promise<BackgroundVideoHydrated[]>;
  addBackgroundVideo: (data: BackgroundVideoDry) => Promise<BackgroundVideoHydrated>;
  deleteBackgroundVideo: (id: BackgroundVideoHydrated['_id']) => Promise<string>;
  getUploadURL: (fileName: string) => Promise<UploadURLResponse>;
};

export enum Action {
  FETCH = 'FETCH',
  ADD = 'ADD',
}

export type Payload = {
  [Action.FETCH]: {
    backgroundVideos: IState['backgroundVideos'];
  };
  [Action.ADD]: BackgroundVideoDry;
};
