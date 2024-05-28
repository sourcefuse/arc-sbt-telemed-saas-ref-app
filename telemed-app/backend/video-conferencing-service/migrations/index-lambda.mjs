import * as DBMigrate from 'db-migrate';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {Signer} from '@aws-sdk/rds-signer';

export const handler = async (event, context) => {
  const params = {
    dbSecret: {
      name: event.params.dbSecret.name ?? '',
      region: event.params.dbSecret.region ?? 'us-east-1',
    },
    rdsProxyEndpoint: event.params.rdsProxyEndpoint,
    dbName: event.params.dbName,
  };

  console.log('Handler params', params);

  const client = new SecretsManagerClient({
    region: params.dbSecret.region,
  });

  let secretValueResponse;

  try {
    console.log('Fetching the db secret value...');
    secretValueResponse = await client.send(
      new GetSecretValueCommand({
        SecretId: params.dbSecret.name,
        VersionStage: 'AWSCURRENT',
      }),
      {
        requestTimeout: 10000,
      },
    );
  } catch (error) {
    console.error('Failed in fetching secret value');
    console.error(error);
    throw error;
  }

  const secret = JSON.parse(secretValueResponse.SecretString);

  const dbConfig = {
    host: params.rdsProxyEndpoint ?? secret.host,
    username: secret.username,
    port: secret.port,
    password: '[ USING IAM AUTHENTICATION ]',
    database: params.dbName,
  };

  const signer = new Signer({
    hostname: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    region: 'us-east-1',
  });

  const token = await signer.getAuthToken().catch(console.error);
  dbConfig.password = token;
  try {
    process.env.DB_HOST = dbConfig.host;
    process.env.DB_PORT = dbConfig.port;
    process.env.DB_USER = dbConfig.username;
    process.env.DB_PASSWORD = dbConfig.password;
    process.env.DB_USE_SSL = 'true';
    const dbMigrate = DBMigrate.getInstance(true, {
      config: './database.json',
    });

    await dbMigrate.createDatabase(dbConfig.database).catch(console.error);

    process.env.DB_DATABASE = dbConfig.database;
    const dbMigrate2 = DBMigrate.getInstance(true, {
      config: './database.json',
    });
    await dbMigrate2.up();
  } catch (error) {
    console.error(error); // NOSONAR
  }
  return {success: true};
};
