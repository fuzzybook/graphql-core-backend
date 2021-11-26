import dotenv from 'dotenv';
import RolesClass from '../core/roles/controllers/RolesClass';
import fs from 'fs';

dotenv.config({
  path: '.env',
});

export const getRoles = async () => {
  try {
    const rolesClass = new RolesClass();
    const ts = rolesClass.getTS();
    if (process.env.ROLES_PATH) {
      const actual = fs.readFileSync(process.env.ROLES_PATH);
      if (actual.toString() != ts) {
        console.log(`
rebuild roles enum
`);
        fs.writeFileSync(process.env.ROLES_PATH, ts);
        process.exit(1);
      }
    }
  } catch (error) {
    console.log(process.env.ROLES_PATH + ' error');
    process.exit(1);
  }
};
