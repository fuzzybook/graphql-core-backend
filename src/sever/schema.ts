import { buildSchema } from 'type-graphql';
import { siteAuthChecker } from './auth';
import { RolesScalar } from '../core/roles/Scalars';
import { RoleResponse } from '../core/roles/Responses';

// Resolvers
import { FsTemplatesResolver } from '../core/templates/resolvers';
import { FsUserDataController } from '../core/userData/resolvers';
import { RolesResolver } from '../core/roles/resolvers';
import { SystemResolver } from '../core/system/resolvers';
import { UserResolver } from '../core/users/resolvers/UserResolver';

export const buildGraphQLSchema = async () => {
  return await buildSchema({
    resolvers: [UserResolver, FsTemplatesResolver, FsUserDataController, RolesResolver, SystemResolver],
    scalarsMap: [{ type: RoleResponse, scalar: RolesScalar }],
    authChecker: siteAuthChecker,
    authMode: 'null',
    orphanedTypes: [RoleResponse],
  });
};
