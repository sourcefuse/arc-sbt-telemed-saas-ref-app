import '@aws-amplify/ui-react/styles.css';
import { Stack, Typography } from '@mui/material';
import { SITE_TITLE } from 'src/config-global';
import CognitoAuthenticator from './CognitoAuthenticator';
import LoginLayout from 'src/layouts/login/LoginLayout';
import { AuthUser, getCurrentUser } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { Hub } from 'aws-amplify/utils';
import { HubCallback } from '@aws-amplify/core';
import { AmplifyChannel } from '@aws-amplify/core/dist/esm/Hub/types';
import Head from 'next/head';

type CognitoAuthGuardProps = {
  children: React.ReactNode;
};

export default function CognitoAuthGuard({ children }: CognitoAuthGuardProps) {
  const [loadingScreen, showLoadingScreen] = useState(true);

  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    const updateUser: HubCallback<AmplifyChannel> = async (authState) => {
      console.log('auth event', authState);
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch {
        setUser(null);
      }
      showLoadingScreen(false);
    };

    // listen for login/signup events
    Hub.listen('auth', updateUser);

    // check manually the first time because we won't get a Hub event
    updateUser({
      channel: 'auth',
      payload: {
        event: 'Custom',
        message: 'Custom First Time Trigger',
      },
    });
  }, []);

  if (loadingScreen) {
    return <LoadingScreen />;
  }

  if (user) {
    // if user is logged in - no login layout to be rendered
    return <CognitoAuthenticator>{children}</CognitoAuthenticator>;
  }

  const title = `Login • ${SITE_TITLE}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <LoginLayout>
        <Stack>
          <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
            <Typography variant="h4">Sign in to {SITE_TITLE}</Typography>
          </Stack>

          <CognitoAuthenticator>{children}</CognitoAuthenticator>
        </Stack>
      </LoginLayout>
    </>
  );
}
