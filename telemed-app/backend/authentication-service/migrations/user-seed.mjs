import pg from 'pg';

const defaultParams = {
  skipIfTenantExists: false,
  addWebAppClient: false,
  addRoles: false,
  addTenantConfig: false,
  addUsers: false,
  tenant: {
    name: '',
    status: 1,
    key: '',
    slug: '',
  },
  dbNames: {
    authentication: '',
    videoConferencing: '',
    notification: '',
  },
  doctor: {
    firstName: 'Demo',
    lastName: 'Doctor',
    email: '',
  },
  patient: {
    firstName: 'Demo',
    lastName: 'Patient',
    email: '',
  },
};

export const dynamicSeedUp = (params = defaultParams, dbConfig) => {
  return new Promise(async (resolve, reject) => {
    // Connection details
    const client = new pg.Client({
      user: dbConfig.user,
      host: dbConfig.host,
      database: dbConfig.database,
      password: dbConfig.password,
      port: dbConfig.port,
      ssl: process.env.DB_USE_SSL === 'true',
    });

    // Connect to the database
    client
      .connect()
      .then(() => {
        console.log('Connected to database');

        const sqlCommands = getSqlCommandsToRun(params);

        const executeTheSeedCommands = () => {
          client
            .query(sqlCommands)
            .then(() => {
              console.log(
                'SQL commands for Dynamic data seeding executed successfully',
              );
              client.end().finally(() => resolve()); // Close the database connection
            })
            .catch(err => {
              console.error('Error executing SQL commands:', err);
              client.end().finally(() => reject(err)); // Close the database connection
            });
        };

        if (params.skipIfTenantExists) {
          client
            .query(
              `select * from main.tenants where key='${params.tenant.key}'`,
            )
            .then(value => {
              const tenantAlreadyExists = value.rowCount === 1;
              if (tenantAlreadyExists) {
                // skipping seed commands if tenant already exists
                console.log(
                  `Skipping the seed script as the tenant with key ${params.tenant.key} already exists.`,
                );
                client.end().finally(() => {
                  resolve();
                });
                return;
              }
              executeTheSeedCommands();
            })
            .catch(err => {
              console.log(
                'Error executing the select command to get tenants:',
                err,
              );
              client.end().finally(() => {
                reject(err);
              });
            });
        } else {
          executeTheSeedCommands();
        }
      })
      .catch(err => {
        console.error('Error connecting to database:', err);
        reject(err);
      });
  });
};

const getSqlCommandsToRun = params => {
  const sqlCommands = `

  SET search_path TO main,public;
  
  ${
    params.addWebAppClient
      ? `insert into auth_clients
  (client_id, client_secret, secret)
  values
      ('webapp','saqw21!@', 'plmnkoqazxsw');`
      : ``
  }
  
  ${
    params.addRoles
      ? `
    insert into roles
    (name, permissions, role_type)
    values
        ('Doctor', '{ViewNotification,CreateNotification,UpdateNotification,DeleteNotification,CanGetNotificationAccess,GenerateMeetingToken,StopMeeting,CreateMeetingSession,EditMeeting,
        1,2,3,4,5}', 0);
    
    insert into roles
    (name, permissions, role_type)
    values
        ('Patient', '{ViewNotification,CreateNotification,UpdateNotification,DeleteNotification,CanGetNotificationAccess,GenerateMeetingToken,StopMeeting,CreateMeetingSession,EditMeeting,
        1,2,3,4,5}', 1);
    `
      : ``
  }
  
  insert into tenants
  (name, status, key)
  values
      ('${params.tenant.name}', ${params.tenant.status}, '${
    params.tenant.key
  }');
  
  
  ${
    params.addTenantConfig
      ? `
  
  insert into tenant_configs
  (config_key, config_value, tenant_id)
  select 'saasConfig', '{"slug":"${params.tenant.slug}"}', id from tenants where key = '${params.tenant.key}' ;
  
  insert into tenant_configs
  (config_key, config_value, tenant_id)
  select 'databaseConfig', '{"authentication":"${params.dbNames.authentication}","videoConferencing":"${params.dbNames.videoConferencing}","notification":"${params.dbNames.notification}"}', id from tenants where key = '${params.tenant.key}' ;
  
  `
      : ``
  }
  
  
  ${
    params.addUsers
      ? `
  insert into users
  (first_name, last_name, username, email, default_tenant_id)
  select '${params.doctor.firstName}', '${params.doctor.lastName}', '${params.doctor.email}', '${params.doctor.email}', id from tenants where key = '${params.tenant.key}' ;
  insert into user_tenants
  (user_id, tenant_id, status, role_id)
  select (select id from users where username = '${params.doctor.email}'), (select id from tenants where key = '${params.tenant.key}'), 1, id from roles where role_type = 0;
  insert into user_credentials
  (user_id, auth_provider, password)
  select U.id, 'internal', '$2a$10$TOLMGK43MjbibS8Jap2RXeHl3.4sJcR3eFbms2dBll2LTMggSK9hG' from users U where U.username = '${params.doctor.email}';
  
  
  insert into users
  (first_name, last_name, username, email, default_tenant_id)
  select '${params.patient.firstName}', '${params.patient.lastName}', '${params.patient.email}', '${params.patient.email}', id from tenants where key = '${params.tenant.key}' ;
  insert into user_tenants
  (user_id, tenant_id, status, role_id)
  select (select id from users where username = '${params.patient.email}'), (select id from tenants where key = '${params.tenant.key}'), 1, id from roles where role_type = 1;
  insert into user_credentials
  (user_id, auth_provider, password)
  select U.id, 'internal', '$2a$10$TOLMGK43MjbibS8Jap2RXeHl3.4sJcR3eFbms2dBll2LTMggSK9hG' from users U where U.username = '${params.patient.email}';
  
  update users set auth_client_ids = array_cat(auth_client_ids, ARRAY[(select id from auth_clients where client_id = 'webapp')::integer]);
  
  `
      : ``
  }
  
      `;
  return sqlCommands;
};
