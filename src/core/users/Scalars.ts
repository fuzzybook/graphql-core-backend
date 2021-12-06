import { GraphQLScalarType } from 'graphql';
import { socialsDefinitions } from '../system/socials';
import { ISocialsDataResponse, ISocialsResponse } from './Responses';

export const SocialsScalar = new GraphQLScalarType({
  name: 'SocialsResponse',
  description: 'Socials object scalar type',
  serialize(value: ISocialsResponse): ISocialsResponse {
    console.log(`SocialsScalar: ${JSON.stringify(value)}`);
    const result = <ISocialsResponse>{};
    for (let i in value as ISocialsResponse) {
      result[i] = {
        icon: value[i].icon,
        label: value[i].label,
        addressMask: value[i].addressMask,
      };
    }
    return result;
  },
  parseValue(value: unknown): Object {
    throw new Error(`SocialsScalar: ${JSON.stringify(value)}`);
    return Object.assign({});
  },
  parseLiteral(ast): Object {
    throw new Error(`SocialsScalar: ${JSON.stringify(ast)}`);
    return Object.assign({});
  },
});

export const normalizeSocials = (data: string | ISocialsDataResponse): ISocialsDataResponse => {
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  const value = data as ISocialsDataResponse;
  const result = <ISocialsDataResponse>{};
  // normalize data
  const allowedDefinitions: string[] = [];
  for (const i in socialsDefinitions) {
    allowedDefinitions.push(i);
    if (!value[i]) {
      result[i] = { address: '' };
    } else {
      result[i] = {
        address: value[i].address,
      };
    }
  }

  for (let i in result) {
    if (!allowedDefinitions.includes(i)) {
      delete result[i];
    }
  }
  return result;
};

export const SocialData = new GraphQLScalarType({
  name: 'SocialData',
  description: 'Socials Data object scalar type',
  serialize(value: ISocialsDataResponse): ISocialsDataResponse {
    return normalizeSocials(value);
  },
  parseValue(value: unknown): Object {
    throw new Error(`SocialsScalar: ${JSON.stringify(value)}`);
    return Object.assign({});
  },
  parseLiteral(ast): Object {
    throw new Error(`SocialsScalar: ${JSON.stringify(ast)}`);
    return Object.assign({});
  },
});
