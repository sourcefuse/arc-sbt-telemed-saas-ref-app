import {get, post} from '@loopback/openapi-v3';
import * as fs from 'fs';
import * as path from 'path';
import {inject} from '@loopback/context';
import {RestBindings, Response} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {
  CONTENT_TYPE,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
} from '@sourceloop/core';
import {
  ChatSessionService,
  PermissionKeys,
  ServiceBindings,
} from '@sourceloop/video-conferencing-service';
import {STRATEGY, authenticate} from 'loopback4-authentication';

export class HomePageController {
  private readonly html: string;
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private readonly response: Response,
    @inject(ServiceBindings.SessionChatService)
    public chatSessionService: ChatSessionService,
  ) {
    this.html = fs.readFileSync(
      path.join(__dirname, '../../public/index.html'),
      'utf-8',
    );
    // Replace base path placeholder from env
    this.html = this.html.replace(
      /\$\{basePath\}/g,
      process.env.BASE_PATH ?? '',
    );
  }

  @authorize({permissions: ['*']})
  @get('/', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Home Page',
        content: {'text/html': {schema: {type: 'string'}}},
      },
    },
  })
  homePage() {
    this.response.status(STATUS_CODE.OK).contentType('html').send(this.html);
    return this.response;
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: [PermissionKeys.CreateSession]})
  @post('/get-meeting-link', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {
              meetingLink: 'string',
            },
          },
        },
      },
    },
  })
  async getMeetingLink() {
    return {
      meetingLink: await this.chatSessionService.getMeetingLink({
        isScheduled: false,
      }),
    };
  }
}
