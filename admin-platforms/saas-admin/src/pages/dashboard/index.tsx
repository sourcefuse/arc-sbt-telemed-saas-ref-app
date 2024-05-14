// next
import Head from 'next/head';
import { Button, Container, Typography } from '@mui/material';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// components
import { useSettingsContext } from '../../components/settings';
import { SITE_TITLE } from 'src/config-global';
import NextLink from 'next/link';
import { PATH_DASHBOARD } from 'src/routes/paths';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

Dashboard.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function Dashboard() {
  const { themeStretch } = useSettingsContext();
  const title = `Dashboard • ${SITE_TITLE}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Dashboard
        </Typography>

        {/* <pre>TBD</pre> */}
        <Button
          component={NextLink}
          href={PATH_DASHBOARD.tenants.root}
          variant="contained"
          startIcon={<Iconify icon="mdi:user" />}
        >
          Manage Tenants
        </Button>
      </Container>
    </>
  );
}
