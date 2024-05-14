import { HydratedEntity, HydratedWithTimestamps, UploadURLResponse } from '../types';
import genres from './genres';

export interface MusicTrackDry {
  title: string;
  path: string;
  genres: Array<string>;
  duration: number;
}

export type MusicTrackHydrated = HydratedWithTimestamps<HydratedEntity<MusicTrackDry>>;

export interface IState {
  dataAvailable: boolean;
  musicTracks: Array<MusicTrackHydrated>;
  allGenres: typeof genres;
}

export type IContext = IState & {
  fetchMusicTracks: () => Promise<MusicTrackHydrated[]>;
  addMusicTrack: (data: MusicTrackDry) => Promise<MusicTrackHydrated>;
  deleteMusicTrack: (id: MusicTrackHydrated['_id']) => Promise<string>;
  getUploadURL: (fileName: string) => Promise<UploadURLResponse>;
};

export enum Action {
  FETCH = 'FETCH',
  ADD = 'ADD',
}

export type Payload = {
  [Action.FETCH]: {
    musicTracks: IState['musicTracks'];
  };
  [Action.ADD]: {
    title: string;
    genres: Array<string>;
    path: string;
    musicFileName: string;
    duration: number;
  };
};
