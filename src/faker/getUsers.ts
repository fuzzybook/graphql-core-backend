import { Profile } from '../core/users/models/Profile';
import { UserStatus } from '../core/users/Responses';
import { User } from '../core/users/models/User';
import { DEFAULT_ROLE, SUPERADMIN } from '../config/roles';
import { defaultRole, roles } from '../../Scripts/roles';

var faker = require('faker');

export const generateUsers = async () => {
  faker.locale = 'de_CH';
  var emails: { [key: string]: string } = {};

  var superadmin_profile = new Profile();

  superadmin_profile.title = faker.name.prefix();
  superadmin_profile.firstName = faker.name.firstName();
  superadmin_profile.lastName = faker.name.lastName();
  superadmin_profile.address1 = faker.address.streetAddress();
  superadmin_profile.address2 = faker.address.secondaryAddress();
  superadmin_profile.zip = faker.address.zipCode();
  superadmin_profile.city = faker.address.city();
  superadmin_profile.country = faker.address.country();

  var superadmin = new User();
  superadmin.email = 'superadmin@fantaskipper.com';
  superadmin.password = 'password';
  superadmin.roles = [roles.superadmin];
  superadmin.status = UserStatus.operating;

  superadmin.profile = superadmin_profile;
  await superadmin.save();

  for (var i = 0; i < 100; i++) {
    // call function with no arguments

    var profile = new Profile();

    profile.title = faker.name.prefix();
    profile.firstName = faker.name.firstName();
    profile.lastName = faker.name.lastName();
    profile.address1 = faker.address.streetAddress();
    profile.address2 = faker.address.secondaryAddress();
    profile.zip = faker.address.zipCode();
    profile.city = faker.address.city();
    profile.country = faker.address.country();

    var email = faker.unique(faker.internet.email); // `${profile.firstName?.toLowerCase()}_${profile.lastName?.toLowerCase()}@${faker.internet.domainName()}`;
    if (typeof emails[email] === 'undefined') {
      emails[email] = email;
      var user = new User();
      user.email = email;
      user.password = 'Password';
      user.roles = [defaultRole];
      user.status = UserStatus.waiting;
      console.log(Object.values(user));

      user.profile = profile;
      await user.save();
    }
  }
};
