import { registerEnumType } from 'type-graphql';
import { RoleType } from '../config/roles';
import Roles from '../core/roles/controllers/RolesClass';
import { UserStatus } from '../core/users/Responses';

export let EnumRoles = <{ [key: string]: string }>{};

export const registerGraphQL = () => {
  const roles = new Roles();
  EnumRoles = roles.getRolesEnum();

  registerEnumType(RoleType, {
    name: 'RoleType',
  });
  registerEnumType(UserStatus, {
    name: 'UserStatus',
  });
  registerEnumType(EnumRoles, {
    name: 'Roles',
  });
};
