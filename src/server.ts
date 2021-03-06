import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';

import { verifyAccessToken } from './core/auth/jwToken';

import dotenv from 'dotenv';
import uaParser from 'ua-parser-js';

import { ContextUser, GraphqlContext } from './server/auth';
import { buildGraphQLSchema } from './server/schema';
import { registerGraphQL } from './server/register';
import { initDB } from './server/db';
import { Session } from './core/users/models/Session';
import Roles from './core/roles/controllers/RolesClass';
import { getRoles } from './Scripts/getRoles';
import path from 'path';
import { generateUsers } from './faker/getUsers';

// carica le variabili d'ambiente dal file .env ddd
dotenv.config({
  path: '.env',
});

const SERVER_PORT = process.env.SERVER_PORT || 4000;

const formatError = (err: Error) => {
  return new Error(err.message);
};

export let server: ApolloServer;

export async function main() {
  registerGraphQL();

  await initDB();

  /// generateUsers();

  const schema = await buildGraphQLSchema();

  async function startApolloServer() {
    const app = express();
    const tmimages = process.env.TRANSACTIONAL_IMAGES_PATH || '';
    app.use('/tmimages', express.static(tmimages));
    app.use('/icons', express.static(process.env.ICONS_PATH || ''));

    const httpServer = http.createServer(app);
    server = new ApolloServer({
      schema,
      formatError,
      context: async ({ req, res }) => {
        let user = undefined;
        const token = req.headers.authorization || '';
        const data = verifyAccessToken(res, token);
        if (data) {
          const session = await Session.findOne({ id: data.session });
          if (session) {
            user = <ContextUser>{ email: session.email, roles: session.roles };
            if (!session.extra) {
              const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
              const ua = uaParser(req.headers['user-agent']);
              session.extra = { ip: (ip || '') as string, ua: ua };
              await session.save();
            }
          }
          const ctx: GraphqlContext = {
            user: user,
            sessionId: data.session,
          };
          return ctx;
        } else {
          const ctx: GraphqlContext = {};
          return ctx;
        }
      },
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();
    server.applyMiddleware({
      app,
      bodyParserConfig: {
        limit: '10mb',
      },
    });
    try {
      await new Promise((resolve) => {
        httpServer.listen({ port: 4000, bodyParserOptions: { limit: '20mb', type: 'application/json' } }, () => {
          console.log(`\x1b[32m\x1b[7m\nHTTP SERVER READY AT http://localhost:4000${server.graphqlPath}\n\x1b[0m`);
        });
        resolve('ok');
      });
    } catch (error) {
      console.log(error);
    }
  }

  await startApolloServer();
  console.log(`\x1b[32m\x1b[7mAPOLLO SERVER WORK\x1b[0m`);
}

// display roles info
