import {Signer} from '@aws-sdk/rds-signer';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
const secretName = process.env.SECRET_NAME;
if (!secretName) {
  throw Error('Secret Name is required.');
}
const client = new SecretsManagerClient();

export interface SecretEnv {
  DB_HOST: string;
  DB_PORT: string;
  DB_USER: string;
  DB_DATABASE: string;
  DB_PASSWORD: string;
  DB_SCHEMA: string;
  JWT_SECRET: string;
  JWT_ISSUER: string;
  VONAGE_API_KEY: string;
  VONAGE_API_SECRET: string;
}

export async function getSecretValue(): Promise<SecretEnv> {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );

  const secret = JSON.parse(response.SecretString!) as SecretEnv;
  secret.DB_PASSWORD = await getRdsAuthToken({
    hostname: secret.DB_HOST,
    port: parseInt(secret.DB_PORT),
    username: secret.DB_USER,
  });
  console.log('Final secret', secret);
  return secret;
}

export function getRdsAuthToken({
  hostname,
  port,
  username,
}: {
  hostname: string;
  port: number;
  username: string;
}) {
  const signer = new Signer({
    /**
     * Required. The hostname of the database to connect to.
     */
    hostname,
    /**
     * Required. The port number the database is listening on.
     */
    port,
    /**
     * Required. The username to login as.
     */
    username,
  });

  return signer.getAuthToken();
}
