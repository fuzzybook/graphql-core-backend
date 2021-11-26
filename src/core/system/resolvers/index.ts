import { Resolver, Query } from 'type-graphql';
import { DEFAULT_ROLE, ROLESADMIN, RoleType, SUPERADMIN } from '../../../config/roles';
import Roles from '../../roles/controllers/RolesClass';
import { IRolesResponse } from '../../roles/Responses';
import { UserStatus } from '../../users/Responses';
import { Enums, System } from '../Responses';

@Resolver()
export class SystemResolver {
  constructor() {}

  @Query(() => Enums)
  async enums() {
    const result = <Enums>{
      userStatus: Object.values(UserStatus),
      roleType: Object.values(RoleType),
    };
    return result;
  }

  @Query(() => System)
  async system() {
    const rolesDefinition = new Roles();
    const roles = rolesDefinition.result.roles as IRolesResponse;
    const enums = <Enums>{
      userStatus: Object.values(UserStatus),
      roleType: Object.values(RoleType),
    };
    const result = <System>{
      enums: enums,
      roles: roles,
      roleSuperadmin: SUPERADMIN,
      roleDefault: DEFAULT_ROLE,
      roleRolesAdmin: ROLESADMIN,
      rolesTree: rolesDefinition.result.tree,
    };
    return result;
  }
}
