import { Field, ObjectType } from 'type-graphql';
import { EnumRoles } from '../../sever/register';
import { AuthRolesResponse, IRolesResponse } from '../roles/Responses';
import { RolesScalar } from '../roles/Scalars';

@ObjectType()
export class Enums {
  @Field(() => [String])
  roleType: string[];
  @Field(() => [String])
  userStatus: string[];
  @Field(() => [EnumRoles])
  test: typeof EnumRoles;
}

@ObjectType()
export class System {
  @Field(() => Enums)
  enums: Enums;
  @Field(() => RolesScalar, { description: 'type RolesResponse = { [key: string]: RoleResponse }; defined in client' })
  roles: IRolesResponse;
  @Field(() => String)
  roleSuperadmin: string;
  @Field(() => String)
  roleDefault: string;
  @Field(() => String)
  roleRolesAdmin: string;
  @Field(() => AuthRolesResponse, { nullable: true })
  rolesTree?: AuthRolesResponse;
}
