import { GraphQLScalarType } from 'graphql';
import { IRolesResponse } from './Responses';

export const RolesScalar = new GraphQLScalarType({
  name: 'RolesResponse',
  description: 'Roles object scalar type',
  serialize(value: IRolesResponse): IRolesResponse {
    const result = <IRolesResponse>{};
    for (let i in value as IRolesResponse) {
      result[i] = {
        path: value[i].path,
        icon: value[i].icon,
        user: value[i].user,
        route: value[i].route,
        type: value[i].type,
        description: value[i].description,
      };
    }
    return result;
  },
  parseValue(value: unknown): Object {
    throw new Error('RolesScalar ir read only');
    return Object.assign({});
  },
  parseLiteral(ast): Object {
    throw new Error('RolesScalar ir read only');
    return Object.assign({});
  },
});
