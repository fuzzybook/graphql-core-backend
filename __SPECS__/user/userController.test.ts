import { Connection, getConnection, getConnectionManager } from 'typeorm';
import { connectionOptions } from '../../src/server/db';
import { UserController } from '../../src/core/users/controllers/User';
import { GraphqlContext } from '../../src/server/auth';

let dbConnection: Connection | undefined;

const connection = {
  async create() {
    const connectionManager = getConnectionManager();
    if (!connectionManager.has('default')) {
      connectionManager.create(connectionOptions);
    }
    dbConnection = connectionManager.get();
    return await dbConnection.connect();
  },

  async close() {
    await getConnection().close();
  },

  async clear() {
    const connection = getConnection();
    const entities = connection.entityMetadatas;
    /* entities.forEach(async (entity) => {
        const repository = connection.getRepository(entity.name);
        await repository.query(`DELETE FROM ${entity.tableName}`);
      }); */
  },
};

beforeAll(async () => {
  const connectionManager = getConnectionManager();
  if (!connectionManager.has('default')) {
    connectionManager.create(connectionOptions);
  }
  dbConnection = connectionManager.get();
  await dbConnection.connect();
});

afterAll(() => {
  connection.close();
});

/* beforeEach(async () => {
  await connection.clear();
}); */

describe('Uuser Controller Test', () => {
  describe('Test connection', () => {
    it('should return an active connection', () => {
      const con = getConnection();
      expect(con).not.toBeNull();
      expect(con.options).toMatchObject(connectionOptions);
    });
  });

  describe('getAll  method', () => {
    it('should return all users or void array', async () => {
      const userController = new UserController();
      expect(userController).not.toBeNull();
      const result = await userController.getAll();
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBeTruthy();
    });
  });

  describe('me  method', () => {
    it('should fail without context', async () => {
      const userController = new UserController();
      expect(userController).not.toBeNull();
      const ctx = <GraphqlContext>{};
      const result = await userController.me(ctx);
      expect(result).toBeNull();
    });

    it('should fail with empty email', async () => {
      const userController = new UserController();
      expect(userController).not.toBeNull();
      const ctx = <GraphqlContext>{ user: { email: '', roles: [] } };
      const result = await userController.me(ctx);
      expect(result).toBeNull();
    });

    it('should get superadmin@fantaskipper.com data', async () => {
      const userController = new UserController();
      expect(userController).not.toBeNull();
      const ctx = <GraphqlContext>{ user: { email: 'superadmin@fantaskipper.com', roles: [] } };
      const result = await userController.me(ctx);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('email', 'superadmin@fantaskipper.com');
      console.log(result);
    });
  });
});
