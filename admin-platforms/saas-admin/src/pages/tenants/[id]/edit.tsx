// next
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import TenantNewEditForm from '../../../sections/@dashboard/tenant/TenantNewEditForm';
import { useEffect, useState } from 'react';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { SITE_TITLE } from 'src/config-global';
import { Tenant, TenantProvider, useTenants } from 'src/data/tenants';

// ----------------------------------------------------------------------

TenantEditPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>
    <TenantProvider>{page}</TenantProvider>
  </DashboardLayout>
);

// ----------------------------------------------------------------------

export default function TenantEditPage() {
  const router = useRouter();

  const [currentTenant, setCurrentTenant] = useState<null | Tenant>(null);
  const { themeStretch } = useSettingsContext();
  const { fetchTenant } = useTenants();

  useEffect(() => {
    if (!router.isReady) return;
    fetchTenant(router.query.id as string).then((data) => {
      setCurrentTenant(data);
    });
  }, [router.isReady]);

  if (currentTenant === null) {
    return <LoadingScreen />;
  }

  const title = `Tenant: Edit • ${SITE_TITLE}`;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Tenant"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Tenants',
              href: PATH_DASHBOARD.tenants.root,
            },
            { name: currentTenant?.tenantName },
          ]}
        />

        <TenantNewEditForm isEdit currentTenant={currentTenant} />
      </Container>
    </>
  );
}
