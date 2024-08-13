import { execSync } from 'child_process';

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';

import { PrismaService } from '../src/prisma/prisma.service';

let postgresContainer: StartedPostgreSqlContainer;
let postgresClient: Client;
let prismaService: PrismaService;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer().start();

  postgresClient = new Client({
    host: postgresContainer.getHost(),
    port: postgresContainer.getPort(),
    database: postgresContainer.getDatabase(),
    user: postgresContainer.getUsername(),
    password: postgresContainer.getPassword()
  });

  await postgresClient.connect();

  //Set new database Url
  const databaseUrl = `postgresql://${postgresClient.user}:${postgresClient.password}@${postgresClient.host}:${postgresClient.port}/${postgresClient.database}`;

  // Execute Prisma migrations
  execSync('npx prisma migrate dev', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    }
  });

  //Set prisma instance
  prismaService = new PrismaService({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['query']
  });

  console.log('connected to test db...');
});

afterAll(async () => {
  //Stop container as well as postgresClient
  await postgresClient.end();
  await postgresContainer.stop();

  console.log('test db stopped');
});

// add some timeout until containers are up and working
jest.setTimeout(10000);

export { postgresClient, prismaService };
