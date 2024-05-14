const {Client} = require('pg');

const params = {
  addWebAppClient: process.env.ADD_WEB_APP_CLIENT === 'yes',
  addRoles: process.env.ADD_ROLES === 'yes',
  tenant: {
    name: process.env.TENANT_NAME,
    status: process.env.TENANT_STATUS ?? 1,
    key: process.env.TENANT_KEY,
  },
  doctor: {
    firstName: process.env.DOCTOR_FIRST_NAME ?? 'Demo',
    lastName: process.env.DOCTOR_LAST_NAME ?? 'Doctor',
    email: process.env.DOCTOR_EMAIL ?? '',
  },
  patient: {
    firstName: process.env.PATIENT_FIRST_NAME ?? 'Demo',
    lastName: process.env.PATIENT_LAST_NAME ?? 'Patient',
    email: process.env.PATIENT_EMAIL ?? '',
  },
};

console.log('Users Seed Params', params);

// Connection details
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to the database
client
  .connect()
  .then(() => {
    console.log('Connected to database');

    // Execute SQL commands
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
    ('${params.tenant.name}', ${params.tenant.status}, '${params.tenant.key}');


insert into users
(first_name, last_name, username, email, default_tenant_id)
select '${params.doctor.firstName}', '${params.doctor.lastName}', '${
      params.doctor.email
    }', '${params.doctor.email}', id from tenants where key = '${
      params.tenant.key
    }' ;
insert into user_tenants
(user_id, tenant_id, status, role_id)
select (select id from users where username = '${
      params.doctor.email
    }'), (select id from tenants where key = '${
      params.tenant.key
    }'), 1, id from roles where role_type = 0;
insert into user_credentials
(user_id, auth_provider, password)
select U.id, 'internal', '$2a$10$TOLMGK43MjbibS8Jap2RXeHl3.4sJcR3eFbms2dBll2LTMggSK9hG' from users U where U.username = '${
      params.doctor.email
    }';


insert into users
(first_name, last_name, username, email, default_tenant_id)
select '${params.patient.firstName}', '${params.patient.lastName}', '${
      params.patient.email
    }', '${params.patient.email}', id from tenants where key = '${
      params.tenant.key
    }' ;
insert into user_tenants
(user_id, tenant_id, status, role_id)
select (select id from users where username = '${
      params.patient.email
    }'), (select id from tenants where key = '${
      params.tenant.key
    }'), 1, id from roles where role_type = 1;
insert into user_credentials
(user_id, auth_provider, password)
select U.id, 'internal', '$2a$10$TOLMGK43MjbibS8Jap2RXeHl3.4sJcR3eFbms2dBll2LTMggSK9hG' from users U where U.username = '${
      params.patient.email
    }';

update users set auth_client_ids = array_cat(auth_client_ids, ARRAY[(select id from auth_clients where client_id = 'webapp')::integer]);
    `;

    client
      .query(sqlCommands)
      .then(() => {
        console.log(
          'SQL commands for Dynamic data seeding executed successfully',
        );
        client.end().finally(() => process.exit()); // Close the database connection
      })
      .catch(err => {
        console.error('Error executing SQL commands:', err);
        client.end().finally(() => process.exit(1)); // Close the database connection
      });
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);
  });
