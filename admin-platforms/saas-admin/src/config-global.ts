// routes
import { PATH_DASHBOARD } from './routes/paths';

export const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE || 'ARC SaaS Admin';
export const API_HOST = process.env.NEXT_PUBLIC_API_HOST || '';

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = PATH_DASHBOARD;

export const COGNITO_CONFIG = {
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
};

export const HEADER = {
  H_MOBILE: 64,
  H_MAIN_DESKTOP: 88,
  H_DASHBOARD_DESKTOP: 92,
  H_DASHBOARD_DESKTOP_OFFSET: 92 - 32,
};

export const NAV = {
  W_BASE: 260,
  W_DASHBOARD: 280,
  W_DASHBOARD_MINI: 88,
  //
  H_DASHBOARD_ITEM: 48,
  H_DASHBOARD_ITEM_SUB: 36,
  //
  H_DASHBOARD_ITEM_HORIZONTAL: 32,
};

export const ICON = {
  NAV_ITEM: 24,
  NAV_ITEM_HORIZONTAL: 22,
  NAV_ITEM_MINI: 22,
};
