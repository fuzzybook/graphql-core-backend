import { Field, ObjectType } from 'type-graphql';
import { RoleType } from '../../config/roles';

@ObjectType()
export class RoleResponse {
  @Field()
  path: string;
  @Field()
  icon: string;
  @Field()
  user: number;
  @Field()
  route: number;
  @Field(() => RoleType)
  type: RoleType;
  @Field(() => String)
  description: RoleType;
}

@ObjectType()
export class AuthRolesResponse {
  @Field(() => String, { nullable: true })
  role?: string;
  @Field(() => RoleType, { nullable: true })
  type?: RoleType;
  @Field(() => String, { nullable: true })
  icon?: string;
  @Field(() => Number, { nullable: true })
  route?: number;
  @Field(() => Boolean, { nullable: true })
  selected?: boolean = false;
  @Field(() => [AuthRolesResponse], { nullable: true })
  roles?: AuthRolesResponse[];
}

export type IRolesResponse = { [key: string]: RoleResponse };

@ObjectType()
export class RolesInfo {
  @Field(() => String)
  ts: string;
}
