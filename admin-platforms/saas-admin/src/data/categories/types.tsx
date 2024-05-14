import { HydratedEntity, HydratedWithTimestamps, PatchPayload } from '../types';

export enum AssetGroup {
  'COMMON' = 1,
  'PRODUCT_IMAGES',
  'TEMPLATES',
}

export interface CategoryDry {
  name: string;
  assetGroup: AssetGroup;
}

export type CategoryHydrated = HydratedWithTimestamps<HydratedEntity<CategoryDry>>;

export interface IState {
  dataAvailable: boolean;
  categories: Array<CategoryHydrated>;
}

export type IContext = IState & {
  fetchCategories: () => Promise<CategoryHydrated[]>;
  addCategory: (data: CategoryDry) => Promise<CategoryHydrated>;
  patchCategory: (id: string, data: Omit<CategoryDry, 'assetGroup'>) => Promise<CategoryHydrated>;
  deleteCategory: (id: string) => Promise<string>;
};

export enum Action {
  FETCH = 'FETCH',
  PATCH = 'PATCH',
}

export type Payload = {
  [Action.FETCH]: {
    categories: IState['categories'];
  };
  [Action.PATCH]: PatchPayload<CategoryDry>;
};
