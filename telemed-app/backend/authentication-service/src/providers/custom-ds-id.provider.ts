import {Provider} from '@loopback/context';
import {AnyObject} from '@loopback/repository';
import {DatasourceIdentifierFn} from 'loopback4-dynamic-datasource';

export class CustomDatasourceIdentifierProvider
  implements Provider<DatasourceIdentifierFn>
{
  constructor() {}

  value(): DatasourceIdentifierFn {
    return async (requestCtx: AnyObject) => {
      // console.log(requestCtx.request);
      const authorizationHeader = requestCtx.request.headers['authorization'];
      if (authorizationHeader) {
        const token = authorizationHeader.replace('Bearer ', '');
        if (token) {
          // console.log('Token', token);
          const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString(),
          );
          if (payload?.tenantId) {
            return {id: payload?.tenantId};
          }
        }
      }
      const tenantSlug = requestCtx.request.query['tenantSlug'] as string;
      return !tenantSlug ? null : {id: tenantSlug};
    };
  }
}
