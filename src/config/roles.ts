export enum RoleType {
  super = 'super',
  root = 'root',
  leaf = 'leaf',
}

export interface AuthRoles {
  label: string;
  role: string;
  type: RoleType;
  icon?: string;
  route?: number;
  auth?: number;
  description?: string;
  roles: AuthRoles[];
}

// utilizzare nomi singoli
// introdurre il ruolo di ROLESMANAGER necessario per il setup dei ruoli e configurabile solo da superadmin

export const authRoles: AuthRoles = {
  label: 'superadmin',
  role: 'superadmin',
  type: RoleType.super,
  icon: 'vpn_key',
  description: 'reserved for system administrator',
  roles: [
    {
      label: 'site',
      role: 'site',
      type: RoleType.root,
      icon: 'self_improvement',
      description: 'Root for site users',
      roles: [
        {
          label: 'user',
          role: 'user',
          type: RoleType.leaf,
          description: 'Active user',
          roles: [
            {
              label: 'visitor',
              role: 'visitor',
              type: RoleType.leaf,
              description: 'Not confirmed user',
              roles: [],
            },
          ],
        },
        {
          label: 'author',
          role: 'author',
          type: RoleType.leaf,
          description: 'Author',
          roles: [],
        },
      ],
    },
    {
      label: 'admin',
      role: 'admin',
      type: RoleType.root,
      icon: 'supervisor_account',
      description: 'Root for site administrators',
      roles: [
        {
          label: 'supervisor',
          role: 'supervisor',
          type: RoleType.leaf,
          description: 'Activity supervisor',
          roles: [],
        },
        {
          label: 'usersadmin',
          role: 'usersadmin',
          type: RoleType.leaf,
          description: 'Users administrator',
          roles: [],
        },
        {
          label: 'rolesadmin',
          role: 'rolesadmin',
          type: RoleType.leaf,
          description: 'Roles Manager',
          roles: [],
        },
      ],
    },
  ],
};

export const SUPERADMIN = 'SUPERADMIN';
export const DEFAULT_ROLE = 'VISITOR';
export const ROLESADMIN = 'ROLESADMIN';
