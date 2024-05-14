export enum AccountStatuses {
  IN_PROGRESS = 'In progress',
  ACTIVE = 'Active',
}

export enum AccountPermissions {
  /**
   * Manage admin accounts (super admin)
   */
  MANAGE_ADMIN_USERS = 'MANAGE_ADMIN_USERS',

  /**
   * Login access to admin dashboard (admin)
   */
  ADMIN_BASIC = 'ADMIN_BASIC',

  /**
   * Perform Operations on normal and agency users (admin)
   */
  MANAGE_USERS = 'MANAGE_USERS',
  DELETE_USERS = 'DELETE_USERS',

  /**
   * Perform Operations on music assets
   */
  MANAGE_MUSIC_TRACKS = 'MANAGE_MUSIC_TRACKS',

  /**
   * Perform Operations on categories
   */
  MANAGE_CATEGORIES = 'MANAGE_CATEGORIES',

  /**
   * Perform Operations on fonts
   */
  MANAGE_FONTS = 'MANAGE_FONTS',

  /**
   * Login access to user dashboard (normal user)
   */
  USER_BASIC = 'USER_BASIC',

  /**
   * For agency accounts (agency user)
   */
  MANAGE_SUB_USERS = 'MANAGE_SUB_USERS',
}

export enum TenantTier {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

export type TenantInfo = {
  tenantName: string;
  siteTitle: string;
  tier: TenantTier;
  email: string;
  tenantSlug: string;
};

export type Tenant = TenantInfo & {
  isActive: boolean;
  /**
   * UUID
   */
  tenantId: string;
  tenantStatus: AccountStatuses;
};

export type IState = {
  dataAvailable: boolean;
  tenants: Array<Tenant>;
};

export type IContext = IState & {
  fetchTenants: () => Promise<void>;
  fetchTenant: (id: string) => Promise<Tenant>;
  patchTenant: (id: string, data: Partial<Tenant>) => Promise<Tenant>;
  createTenant: (data: TenantInfo) => Promise<Tenant>;
  deleteTenant: (id: Tenant['tenantId']) => Promise<string>;
};

export enum Action {
  FETCH = 'FETCH',
}

export type Payload = {
  [Action.FETCH]: {
    tenants: IState['tenants'];
  };
};
