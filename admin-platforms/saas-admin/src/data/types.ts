export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
  ? {
    type: Key;
  }
  : {
    type: Key;
    payload: M[Key];
  };
};

export type ActionsType<Payload extends { [index: string]: any }> =
  ActionMapType<Payload>[keyof ActionMapType<Payload>];

export interface UploadURLResponse {
  /**
   * Signed URL of s3 assets requested, that can be used to upload binary files using PUT method.
   * By default valid upto 15 Minutes
   */
  uploadURL: string;

  /**
   * Final Path containing prefix and file name.
   * eg. `assets/tracks/117fdae-music.mp3`
   */
  path: string;
}

export interface ITimestamps {
  createdAt: string;
  updatedAt: string;
}

export type HydratedEntity<T> = T & {
  _id: string;
}
export type HydratedWithTimestamps<T> = T & ITimestamps;

export type PatchPayload<Entity, IdentifierType = string> = Entity & { id: IdentifierType };
