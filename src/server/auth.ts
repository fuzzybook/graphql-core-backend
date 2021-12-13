import { AuthChecker } from 'type-graphql';

export interface ContextUser {
  email: string;
  roles: string[];
}

export interface GraphqlContext {
  user?: ContextUser | undefined;
  sessionId?: string | undefined;
}

export const siteAuthChecker: AuthChecker<GraphqlContext> = ({ context: { user } }, roles) => {
  console.log(user?.roles);
  console.log(roles);
  if (roles.length === 0) {
    if (user !== undefined) return true;
    throw new Error('notaurhorized');
  }
  // there are some roles defined now

  if (!user) {
    // and if no user, restrict access
    throw new Error('notaurhorized');
    return false;
  }

  if (user.roles.some((role) => roles.includes(role))) {
    // grant access if the roles overlap
    console.log(user.roles, roles);
    return true;
  }

  // no roles matched, restrict access
  throw new Error('notaurhorized');
  return false;
};
