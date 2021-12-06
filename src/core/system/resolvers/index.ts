import { Resolver, Query } from 'type-graphql';
import { RoleType } from '../../../config/roles';
import Roles from '../../roles/controllers/RolesClass';
import { roles } from '../../roles/generated';
import { IRolesResponse } from '../../roles/Responses';
import { UserStatus } from '../../users/Responses';
import { Enums, System } from '../Responses';
import { socialsDefinitions } from '../socials';

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
    const _roles = rolesDefinition.result.roles as IRolesResponse;
    const enums = <Enums>{
      userStatus: Object.values(UserStatus),
      roleType: Object.values(RoleType),
    };

    const result = <System>{
      enums: enums,
      roles: _roles,
      roleSuperadmin: roles.superadmin,
      roleDefault: roles.visitor,
      roleRolesAdmin: roles.rolesadmin,
      rolesTree: rolesDefinition.result.tree,
      socials: socialsDefinitions,
    };

    return result;
  }
}
