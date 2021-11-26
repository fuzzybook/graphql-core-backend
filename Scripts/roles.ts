export enum roles {
  superadmin = 'SUPERADMIN', // reserved for system administrator
  site = 'SITE', // Root for site users
  user = 'USER', // Active user
  visitor = 'VISITOR', // Not confirmed user
  author = 'AUTHOR', // Author
  admin = 'ADMIN', // Root for site administrators
  supervisor = 'SUPERVISOR', // Activity supervisor
  usersadmin = 'USERSADMIN', // Users administrator
  rolesadmin = 'ROLESADMIN', // Roles Manager
}
export const superadmin = roles.superadmin;
export const defaultRole = roles.user;
export const rolesAdmin = roles.rolesadmin;

const enums = {
  userStatus: { waiting: 'waiting', operating: 'operating', suspended: 'suspended', banned: 'banned' },
  roleType: { super: 'super', root: 'root', leaf: 'leaf' },
};

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

export interface IRoles {
  [key: string]: IRole;
}

export const rolesData = {
  SUPERADMIN: {
    path: '.SUPERADMIN.',
    user: 511,
    // 0000000000000000000000000000000000000000000000000000000111111111
    route: 1,
    // 0000000000000000000000000000000000000000000000000000000000000001
    level: '3',
    type: RoleType.super,
    description: 'reserved for system administrator',
  },
  SITE: {
    path: '.SUPERADMIN.SITE.',
    user: 30,
    // 0000000000000000000000000000000000000000000000000000000000011110
    route: 2,
    // 0000000000000000000000000000000000000000000000000000000000000010
    level: '2',
    type: RoleType.root,
    description: 'Root for site users',
  },
  USER: {
    path: '.SUPERADMIN.SITE.USER.',
    user: 12,
    // 0000000000000000000000000000000000000000000000000000000000001100
    route: 4,
    // 0000000000000000000000000000000000000000000000000000000000000100
    level: '1',
    type: RoleType.leaf,
    description: 'Active user',
  },
  VISITOR: {
    path: '.SUPERADMIN.SITE.USER.VISITOR.',
    user: 8,
    // 0000000000000000000000000000000000000000000000000000000000001000
    route: 8,
    // 0000000000000000000000000000000000000000000000000000000000001000
    level: '0',
    type: RoleType.leaf,
    description: 'Not confirmed user',
  },
  AUTHOR: {
    path: '.SUPERADMIN.SITE.AUTHOR.',
    user: 16,
    // 0000000000000000000000000000000000000000000000000000000000010000
    route: 16,
    // 0000000000000000000000000000000000000000000000000000000000010000
    level: '1',
    type: RoleType.leaf,
    description: 'Author',
  },
  ADMIN: {
    path: '.SUPERADMIN.ADMIN.',
    user: 480,
    // 0000000000000000000000000000000000000000000000000000000111100000
    route: 32,
    // 0000000000000000000000000000000000000000000000000000000000100000
    level: '2',
    type: RoleType.root,
    description: 'Root for site administrators',
  },
  SUPERVISOR: {
    path: '.SUPERADMIN.ADMIN.SUPERVISOR.',
    user: 64,
    // 0000000000000000000000000000000000000000000000000000000001000000
    route: 64,
    // 0000000000000000000000000000000000000000000000000000000001000000
    level: '1',
    type: RoleType.leaf,
    description: 'Activity supervisor',
  },
  USERSADMIN: {
    path: '.SUPERADMIN.ADMIN.USERSADMIN.',
    user: 128,
    // 0000000000000000000000000000000000000000000000000000000010000000
    route: 128,
    // 0000000000000000000000000000000000000000000000000000000010000000
    level: '1',
    type: RoleType.leaf,
    description: 'Users administrator',
  },
  ROLESADMIN: {
    path: '.SUPERADMIN.ADMIN.ROLESADMIN.',
    user: 256,
    // 0000000000000000000000000000000000000000000000000000000100000000
    route: 256,
    // 0000000000000000000000000000000000000000000000000000000100000000
    level: '1',
    type: RoleType.leaf,
    description: 'Roles Manager',
  },
};
