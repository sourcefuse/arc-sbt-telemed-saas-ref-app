// next
import Head from 'next/head';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import TenantNewEditForm from '../../sections/@dashboard/tenant/TenantNewEditForm';
import { SITE_TITLE } from 'src/config-global';
import { TenantProvider } from 'src/data/tenants';

// ----------------------------------------------------------------------

TenantCreatePage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>
    <TenantProvider>{page}</TenantProvider>
  </DashboardLayout>
);

// ----------------------------------------------------------------------

export default function TenantCreatePage() {
  const { themeStretch } = useSettingsContext();
  const title = `Tenant: Create • ${SITE_TITLE}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create a new tenant"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Tenants',
              href: PATH_DASHBOARD.tenants.root,
            },
            { name: 'New Tenant' },
          ]}
        />
        <TenantNewEditForm />
      </Container>
    </>
  );
}
