import {Provider} from '@loopback/context';
import {AnyObject} from '@loopback/repository';
import {DatasourceIdentifierFn} from 'loopback4-dynamic-datasource';

export class CustomDatasourceIdentifierProvider
  implements Provider<DatasourceIdentifierFn>
{
  constructor() {}

  value(): DatasourceIdentifierFn {
    return async (requestCtx: AnyObject) => {
      console.log('query', requestCtx.request.query);
      const tenantSlug = requestCtx.request.query['tenantSlug'] as string;
      return !tenantSlug ? null : {id: tenantSlug};
    };
  }
}
