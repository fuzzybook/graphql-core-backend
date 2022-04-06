import { Connection, ConnectionOptions, createConnection, getConnectionManager } from 'typeorm';

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const config = ['./src/**/*.ts'];

export const connectionOptions: ConnectionOptions = {
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
};

export const initDB = async () => {
  let connection: Connection;
  const connectionManager = getConnectionManager();
  if (!connectionManager.has('default')) { 
    connectionManager.create(connectionOptions);
  }
  connection = connectionManager.get();
  await connection.connect();
  return connection;
};
