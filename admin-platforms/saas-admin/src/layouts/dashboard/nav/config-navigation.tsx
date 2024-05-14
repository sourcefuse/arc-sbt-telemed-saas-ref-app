// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: icon('ic_user'),
  dashboard: icon('ic_dashboard'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'General',
    items: [{ title: 'Dashboard', path: PATH_DASHBOARD.root, icon: ICONS.dashboard }],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [{ title: 'tenants', path: PATH_DASHBOARD.tenants.root, icon: ICONS.user }],
  },
];

export default navConfig;
