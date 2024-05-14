import {Provider} from '@loopback/context';
import {juggler, repository} from '@loopback/repository';
import {TenantRepository} from '@sourceloop/authentication-service';
import {DatasourceProviderFn} from 'loopback4-dynamic-datasource';

export class CustomDatasourceProvider
  implements Provider<DatasourceProviderFn>
{
  constructor(
    @repository(TenantRepository)
    private tenantRepo: TenantRepository,
  ) {}

  value(): DatasourceProviderFn {
    return async datasourceIdentifier => {
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        AuthDB: async () => {
          const dbName = !datasourceIdentifier
            ? process.env.DB_DATABASE
            : `authentication-service-${datasourceIdentifier.id}`;

          return new juggler.DataSource({
            name: 'AuthDB',
            connector: 'postgresql',
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: dbName,
            schema: process.env.DB_SCHEMA,
          });
        },
      };
    };
  }
}
