import { Resolver, Query } from 'type-graphql';
import Roles from '../controllers/RolesClass';
import { RolesInfo } from '../Responses';
import { RolesScalar } from '../Scalars';

@Resolver()
export class RolesResolver {
  constructor() {}

  @Query(() => RolesScalar)
  async roles() {
    const roles = new Roles();
    return roles.result.roles;
  }

  // do this only in developement
  @Query(() => RolesInfo)
  async rolesInfo() {
    const roles = new Roles();
    const result = <RolesInfo>{
      ts: roles.getTS(),
    };
    return result;
  }
}
