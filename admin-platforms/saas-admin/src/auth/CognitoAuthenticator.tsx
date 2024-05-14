import { withAuthenticator, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from 'src/data/auth';
import { COGNITO_CONFIG } from 'src/config-global';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: COGNITO_CONFIG.userPoolClientId || '',
      userPoolId: COGNITO_CONFIG.userPoolId || '',
    },
  },
});

type CognitoAuthWrapperProps = {
  children: React.ReactNode;
} & WithAuthenticatorProps;

/**
 * Renders Cognito login form if not logged in or children otherwise
 */
function CognitoAuthenticator({ children }: CognitoAuthWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default withAuthenticator(CognitoAuthenticator, {
  hideSignUp: true,
  variation: 'default',
});
