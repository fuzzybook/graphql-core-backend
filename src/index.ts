import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';

import { verifyAccessToken } from './core/auth/jwToken';

import dotenv from 'dotenv';
import uaParser from 'ua-parser-js';

import { ContextUser, GraphqlContext } from './sever/auth';
import { buildGraphQLSchema } from './sever/schema';
import { registerGraphQL } from './sever/register';
import { initDB } from './sever/db';
import { Session } from './core/users/models/Session';
import Roles from './core/roles/controllers/RolesClass';
import { getRoles } from './Scripts/getRoles';

// carica le variabili d'ambiente dal file .env ddd
dotenv.config({
  path: '.env',
});

process.once('SIGUSR2', function () {
  console.log(`\nBye fom process ${process.pid}\n`);
  process.kill(process.pid, 'SIGUSR2');
});

class ConsoleSpiner {
  counter = 0;
  timer: NodeJS.Timeout;
  constructor() {
    this.counter = 0;
  }

  Turn() {
    this.counter++;
    switch (this.counter % 4) {
      case 0:
        console.log('/');
        break;
      case 1:
        console.log('-');
        break;
      case 2:
        console.log('\\');
        break;
      case 3:
        console.log('|');
        break;
    }
    console.log('\x1b[1D\x1b[2A');
  }

  Run() {
    this.timer = setInterval(() => {
      this.Turn();
    }, 500);
  }

  Stop() {
    clearInterval(this.timer);
  }
}

const consoleSpinner = new ConsoleSpiner();

const SERVER_PORT = process.env.SERVER_PORT || 4000;
console.log('\x1b[2J\x1b[34m\x1b[7m\nENV SERVER PORT:', SERVER_PORT, '\n\x1b[0m');

const formatError = (err: Error) => {
  return new Error(err.message);
};

export let server: ApolloServer;

async function main() {
  registerGraphQL();

  await initDB();

  const schema = await buildGraphQLSchema();

  async function startApolloServer() {
    const app = express();
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
    server.applyMiddleware({ app });
    try {
      await new Promise((resolve) => {
        httpServer.listen({ port: 4000 }, () => {
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
const roles = new Roles(true);
const notFounded = roles.testRoles();
if (notFounded) {
  console.log(`\x1b[1;31mRoles: [${notFounded}] not declared!\x1b[0m
    `);
  process.exit();
}

getRoles().then(() => {
  consoleSpinner.Run();
  main();
});
