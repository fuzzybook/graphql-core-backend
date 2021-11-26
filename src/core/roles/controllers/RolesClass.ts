import { AuthRoles, authRoles, SUPERADMIN, DEFAULT_ROLE, RoleType } from '../../../config/roles';

import { getMetadataStorage } from 'type-graphql';
import { AuthorizedMetadata } from 'type-graphql/dist/metadata/definitions';

interface AuthorizationInfo {
  endpoint: string;
  roles: string[];
}

export class Role {
  id: number;
  path: string;
  user: number;
  route: number;
  level: number;
  label?: string;
  type: RoleType;
  icon: string;
  description: string;
}

export class RolesResult {
  roles: { [key: string]: Role };
  tree: AuthRoles;
  superadmin: string;
  defaultRole: string;
}

export default class Roles {
  v = 1;
  r: { [key: string]: Role } = {};
  level = -1;
  id = -1;
  maxLevel = 0;
  result: RolesResult;

  constructor(print: boolean = false) {
    try {
      this.parseRoles(authRoles, '');
      this.result = { roles: this.r, tree: authRoles, superadmin: SUPERADMIN, defaultRole: DEFAULT_ROLE };
      this.build(print);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  getAuthorizationInfo(): { [key: string]: AuthorizationInfo[] } {
    const metaData = getMetadataStorage();
    const authorizationInfo: { [key: string]: AuthorizationInfo[] } = {};
    metaData.authorizedFields.map((item: AuthorizedMetadata) => {
      if (!authorizationInfo[item.target.name]) {
        authorizationInfo[item.target.name] = [];
      }
      authorizationInfo[item.target.name].push({
        endpoint: item.fieldName,
        roles: item.roles,
      });
    });
    return authorizationInfo;
  }

  getAuth(roles: string[] = []): number {
    let auth = 0;
    roles.map((r) => {
      console.log(r, this.r[r].user);
      auth |= this.r[r].user;
    });
    return auth;
  }

  parseRoles(o: AuthRoles, pre: string) {
    this.level++;
    this.id++;
    let k = `${pre}.${o.role}`.toUpperCase();

    const path = `${pre}.${o.role}.`.toUpperCase();

    this.r[o.label.toUpperCase()] = {
      path: path,
      label: o.label,
      user: 0,
      route: this.v,
      level: this.level,
      id: this.id,
      type: o.type,
      icon: o.icon || '',
      description: o.description || '',
    };
    this.maxLevel = Math.max(this.maxLevel, this.level);
    this.v = this.v << 1;
    if (o.roles.length > 0) {
      for (let i in o.roles) {
        this.parseRoles(o.roles[i], `${pre}.${o.role}`);
        this.level--;
      }
    }
  }

  getItem(key: string) {
    let val = 0;
    for (let i in this.r) {
      if (this.r[i].path == key) {
        val = this.r[i].route;
      } else if (this.r[i].path.includes(key)) {
        val += this.r[i].route;
      }
    }
    return val;
  }

  setRoute(o: AuthRoles, key: string, route: number) {
    const find = (o: AuthRoles, key: string, route: number) => {
      if (o.role.toUpperCase() === key) {
        o.route = route;
        return;
      }
      for (let i = 0; i != o.roles.length; i++) find(o.roles[i], key, route);
    };
    if (o.role.toUpperCase() === key) {
      o.route = route;
      return;
    }
    find(o, key, route);
  }

  pad(s: string, size: number) {
    while (s.length < (size || 2)) {
      s = '0' + s;
    }
    return s;
  }

  spaces(s: string, size: number) {
    while (s.length < (size || 2)) {
      s = ' ' + s;
    }
    return s;
  }

  build(print: boolean) {
    if (print) {
      console.log('\x1b[32m\n- ROLES ---------------------------------------------------------------------------------');
    }
    for (let i in this.r) {
      this.r[i].level = this.maxLevel - this.r[i].level;
      this.r[i].label = (this.r[i].path.slice(1, -1).split('.')[this.r[i].path.slice(1, -1).split('.').length - 1] || 'unknown').toUpperCase();
      this.r[i].user = this.getItem(this.r[i].path);
      let v = this.r[i];

      if (print) {
        console.log(/* this.pad(v.user.toString(2), 32), this.pad(v.route.toString(2), 32), */ `${this.spaces(v.label?.toLowerCase() || '', 20)}${v.type != RoleType.leaf ? '*' : ' '} - ${this.r[i].description || ''}`);
      }

      this.setRoute(authRoles, i, this.r[i].user);
    }
    if (print) {
      console.log('- ROLES ---------------------------------------------------------------------------------\n\x1b[0m');
    }
  }

  enumToString<T>(e: T) {
    let res = `
    {`;
    Object.values(e).map((s) => {
      res += `${s}: '${s}',
      `;
    });
    res += `
    }
  `;
    return res;
  }

  getRolesEnum(): { [key: string]: string } {
    const Enum = <{ [key: string]: string }>{};
    for (let i in this.r) {
      Enum[i.toLowerCase()] = `'${i}'`;
    }
    return Enum;
  }

  rolesToString(_roles: string[]) {
    let txt: string = '';
    let error = false;
    let notFounded: string = '';

    _roles.map((r) => {
      if (this.r.hasOwnProperty(r)) {
        txt += '\x1b[34m';
      } else {
        error = true;
        notFounded += ` ${r} `;
        txt += '\x1b[1;31m';
      }
      txt += ' ' + r + ' \x1b[0m\x1b[32m';
    });
    return { error, txt, notFounded };
  }

  testRoles() {
    const authorizationInfo = this.getAuthorizationInfo();
    let errors: string = '';
    console.log('\x1b[32m\n- RESOLVERS ------------------------------------------------------------------------------');
    for (let a in authorizationInfo) {
      console.log(a);
      authorizationInfo[a].map((info) => {
        const { error, txt, notFounded } = this.rolesToString(info.roles);
        if (error) errors += notFounded;
        console.log(`  ${info.endpoint} - ${'[' + txt + ']'}`);
      });
    }
    console.log('- RESOLVERS ------------------------------------------------------------------------------\n\x1b[0m');
    return errors;
  }

  // generate ts file for use roles as enum (intellysense)
  getTS(): string {
    let ts: string;

    ts = `export enum roles {
      `;
    for (let i in this.r) {
      ts += `${i.toLowerCase()} = '${i}', // ${this.r[i].description || ''}
      `;
    }
    ts += `}
    `;

    ts += `export const superadmin = roles.superadmin
    `;
    ts += `export const defaultRole = roles.user
    `;
    ts += `export const rolesAdmin = roles.rolesadmin

    `;

    ts += `
    const enums = {
      roleType: ${this.enumToString(RoleType)},
    }

    export enum RoleType {
      super = 'super',
      root = 'root',
      leaf = 'leaf',
    }
    
    export interface IRole {
      path: string;
      user: number;
      route: number;
      level: number;
      type: RoleType;
      description: string;
    }

    export interface IRoles { [key: string]: IRole };

    `;

    ts += `export const rolesData = {
    `;

    for (let i in this.r) {
      ts += `
      '${i}':{
        path: '${this.r[i].path}',
        user: ${this.r[i].user},
        // ${this.pad(this.r[i].user.toString(2), 64)}
        route: ${this.r[i].route},
        // ${this.pad(this.r[i].route.toString(2), 64)}
        level: '${this.r[i].level}',
        type: RoleType.${this.r[i].type},
        description: '${this.r[i].description}'
      },`;
    }
    ts += `
  }
   `;
    return Buffer.from(ts).toString('utf8');
  }
}
