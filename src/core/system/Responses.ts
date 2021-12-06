import { Field, ObjectType } from 'type-graphql';
import { AuthRolesResponse, IRolesResponse } from '../roles/Responses';
import { RolesScalar } from '../roles/Scalars';
import { ISocialsResponse } from '../users/Responses';
import { SocialsScalar } from '../users/Scalars';

@ObjectType()
export class Enums {
  @Field(() => [String])
  roleType: string[];
  @Field(() => [String])
  userStatus: string[];
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
  @Field(() => SocialsScalar, { description: 'type SocialsResponse = { [key: string]: SocialResponse }; defined in client' })
  socials: ISocialsResponse;
}
