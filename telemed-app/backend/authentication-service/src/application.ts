// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {
  AuthServiceBindings,
  AuthenticationServiceComponent,
} from '@sourceloop/authentication-service';
import {CoreConfig, LocaleKey, SFCoreBindings} from '@sourceloop/core';
import {
  AuthenticationBindings,
  AuthenticationConfig,
} from 'loopback4-authentication';
import path from 'path';
import {
  DynamicDatasourceBindings,
  Loopback4DynamicDatasourceComponent,
} from 'loopback4-dynamic-datasource';
import {CustomDatasourceIdentifierProvider} from './providers/custom-ds-id.provider';
import {CustomDatasourceProvider} from './providers/custom-ds.provider';
import {MySequence} from './sequence';
import {CustomJwtPayloadProvider} from './providers/jwt-payload.provider';

export {ApplicationConfig};

export class AuthenticationServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  localeObj: i18nAPI = {} as i18nAPI;

  constructor(options: ApplicationConfig = {}) {
    super(options);

    const configObject: CoreConfig['configObject'] = {
      locales: [
        LocaleKey.en,
        LocaleKey.es,
        LocaleKey.ptBr,
        LocaleKey.ptPt,
        LocaleKey.esCo,
      ],
      fallbacks: {
        [LocaleKey.es]: 'en',
        [LocaleKey.esCo]: 'en',
        [LocaleKey.ptBr]: 'en',
        [LocaleKey.ptPt]: 'en',
      },
      register: this.localeObj,
      directoryPermissions: '777',
      directory: `/tmp`,
      objectNotation: true,
    };

    /* this.bind(SFCoreBindings.EXPRESS_MIDDLEWARES).to([
      setupDataSourceMiddlewareFunction,
    ]); */

    this.bind(SFCoreBindings.config).to({configObject});

    // Set up the custom sequence
    // this.sequence(MySequence);

    this.bind(AuthenticationBindings.CONFIG).to({
      secureClient: true,
    } as AuthenticationConfig);

    this.bind(AuthServiceBindings.Config).to({
      useCustomSequence: true,
    });

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.component(Loopback4DynamicDatasourceComponent);

    this.bind(DynamicDatasourceBindings.DATASOURCE_PROVIDER).toProvider(
      CustomDatasourceProvider,
    );
    this.bind(
      DynamicDatasourceBindings.DATASOURCE_IDENTIFIER_PROVIDER,
    ).toProvider(CustomDatasourceIdentifierProvider);

    this.component(AuthenticationServiceComponent);

    this.bind(AuthServiceBindings.JWTPayloadProvider).toProvider(
      CustomJwtPayloadProvider,
    );

    this.sequence(MySequence);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
