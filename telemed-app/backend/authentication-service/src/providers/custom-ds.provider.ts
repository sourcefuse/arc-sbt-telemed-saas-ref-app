import {Provider} from '@loopback/context';
import {juggler, repository} from '@loopback/repository';
import {TenantConfigRepository} from '@sourceloop/authentication-service';
import {ConfigKey} from '@sourceloop/core';
import {DatasourceProviderFn} from 'loopback4-dynamic-datasource';
export class CustomDatasourceProvider
  implements Provider<DatasourceProviderFn>
{
  constructor(
    @repository(TenantConfigRepository)
    private tenantConfigRepo: TenantConfigRepository,
  ) {}

  value(): DatasourceProviderFn {
    return async datasourceIdentifier => {
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        AuthDB: async () => {
          let dbName = process.env.DB_DATABASE;
          if (datasourceIdentifier) {
            const isTenantId = datasourceIdentifier.id.match(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            );
            console.log('identifier id', datasourceIdentifier.id);
            if (isTenantId) {
              // tenant-id
              const databaseConfig = await this.tenantConfigRepo.findOne({
                where: {
                  tenantId: datasourceIdentifier.id,
                  configKey: 'databaseConfig' as ConfigKey,
                },
              });
              if (databaseConfig) {
                dbName = (
                  databaseConfig?.configValue as {authentication?: string}
                )?.['authentication'];
                console.log('tenant auth db', dbName);
              }
            } else {
              dbName = `authentication-service-${datasourceIdentifier.id}`;
            }
          }

          return new juggler.DataSource({
            name: 'AuthDB',
            connector: 'postgresql',
            debug: true,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: dbName,
            schema: process.env.DB_SCHEMA,
            ssl: true,
          });
        },
      };
    };
  }
}
