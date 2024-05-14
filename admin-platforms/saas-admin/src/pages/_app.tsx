// scroll bar
import 'simplebar/src/simplebar.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------

import { CacheProvider, EmotionCache } from '@emotion/react';
// next
import { NextPage } from 'next';
import Head from 'next/head';
import { AppProps } from 'next/app';
// utils
import createEmotionCache from '../utils/createEmotionCache';
// theme
import ThemeProvider from '../theme';

// components
import ProgressBar from '../components/progress-bar';
import SnackbarProvider from './../components/snackbar';
import { MotionLazyContainer } from '../components/animate';
import { ThemeSettings, SettingsProvider } from '../components/settings';

// ----------------------------------------------------------------------

const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

export default function MyApp(props: MyAppProps) {
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <SettingsProvider>
        <MotionLazyContainer>
          <ThemeProvider>
            <ThemeSettings>
              <SnackbarProvider>
                <ProgressBar />
                {getLayout(<Component {...pageProps} />)}
              </SnackbarProvider>
            </ThemeSettings>
          </ThemeProvider>
        </MotionLazyContainer>
      </SettingsProvider>
    </CacheProvider>
  );
}
