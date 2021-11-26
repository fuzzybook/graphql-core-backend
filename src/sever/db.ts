import { createConnection } from 'typeorm';

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
console.log(`\x1b[34m\x1b[7m\nThe POSTGRES address is: ${POSTGRES_HOST}\n\x1b[0m`);
const config = ['./src/**/*.ts'];

export const initDB = async () => {
  // TODO only delop and ask
  // generateUsers();

  return await createConnection({
    name: 'default',
    type: 'postgres',
    host: POSTGRES_HOST,
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: config,
    logging: false,
    synchronize: true,
  });
};
