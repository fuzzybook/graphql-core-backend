import { UserProfileInput, SetRolesInput, UpdateUserInput, UpdateUserStatusInput, UserInput, UserPreferencesInput, UpdateUserPasswordInput } from '../Inputs';
import { ISocialsDataResponse, LoginResponse, UserResponse, UserStatus } from '../Responses';

import * as bcrypt from 'bcrypt';
import * as dns from 'dns';
import validator from 'validator';

import { ApolloError } from 'apollo-server-errors';
import { AccessTokenData, generateAccessToken } from '../../auth/jwToken';
import { GraphqlContext } from '../../../server/auth';
import Roles from '../../roles/controllers/RolesClass';
import { sendActivation, sendRecoverPassword } from './Mailer';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { ValidationToken, ValidationTokenType } from '../models/ValidationToken';
import { Session } from '../models/Session';
import { roles } from '../../roles/generated';
import { normalizeSocials } from '../Scalars';

export class UserController {
  private EmailValidation(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!validator.isEmail(email)) reject('email.notvalid');
      let mxDomain = email.split('@')[1];
      dns.resolveMx(mxDomain, async (err, adresses) => {
        if (err) reject('email.nomx');
        resolve();
      });
    });
  }

  public async getAll(): Promise<UserResponse[]> {
    const users = await User.find({ relations: ['profile'] });
    const usersResponse: UserResponse[] = [];
    users.map((u) => {
      let o: UserResponse = Object.assign(new UserResponse(), u);
      o.username = `${u.profile.firstName || ''} ${u.profile.lastName || ''}`;
      usersResponse.push(o);
    });
    return usersResponse;
  }

  public async me(ctx: GraphqlContext): Promise<UserResponse | null> {
    if (!ctx.user?.email) {
      return null;
    }
    const user = await User.findOne({ where: { email: ctx.user?.email }, relations: ['profile'] });
    if (!user) {
      //TODO internal error user not found
      return null;
    }
    const roles = new Roles();
    user.auth = roles.getAuth(user.roles);
    return Object.assign(new UserResponse(), user) as UserResponse;
  }

  public async alive(ctx: GraphqlContext): Promise<boolean> {
    if (!ctx.user?.email) {
      return false;
    }
    const user = await User.findOne({ where: { email: ctx.user?.email } });
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    return true;
  }

  public async findByID(id: string): Promise<UserResponse> {
    const user = await User.findOne({ where: { id }, relations: ['profile'] });
    if (!user) {
      throw new ApolloError('non ci sono users con uuid:' + id);
    }
    return Object.assign(new UserResponse(), user) as UserResponse;
  }

  public async create(data: UserInput): Promise<string> {
    try {
      const { email } = data;
      await this.EmailValidation(email);

      if (await User.findOne({ where: { email: email } })) {
        throw new ApolloError('create.existingemail');
      }

      if (!data.profile) {
        data.profile = <UserProfileInput>{};
      }
      const profile = Profile.create(data.profile);
      const user = User.create(data);
      user.roles = [roles.default];
      user.profile = profile;
      await user.save();

      const token = new ValidationToken();
      const tk = await token.generate(ValidationTokenType.register, email, user.id, 5);
      await sendActivation(email, { name: email, token: tk });
      return '';
    } catch (error) {
      throw new ApolloError(error as string);
    }
  }

  async validateActivation(token: string): Promise<Boolean> {
    let vt = await ValidationToken.findOne({ where: { token: token } });
    if (!vt) {
      throw new ApolloError('validate.tokennotvalid');
    }
    if (vt.expire < new Date()) {
      throw new ApolloError('validate.tokenexpired');
    }
    if (vt.fired) {
      throw new ApolloError('validate.tokenfired');
    }
    let user = await User.findOne({ where: { email: vt.email } });
    if (!user) {
      throw new ApolloError('validate.usernotexist');
    }
    user.status = UserStatus.operating;
    user.activated = new Date();
    user.save();
    vt.fired = new Date();
    vt.save();
    return true;
  }

  async update(data: UpdateUserInput) {
    let user = await User.findOne({ where: { id: data.id }, relations: ['profile'] });
    if (!user) throw new ApolloError('User non trovato');
    user = Object.assign(user, data) as User;
    await user.save();
    return Object.assign(new UserResponse(), user) as UserResponse;
  }

  async updateStatus(data: UpdateUserStatusInput) {
    let user = await User.findOne({ where: { id: data.id } });
    if (!user) throw new ApolloError('usernotfound');
    user.status = UserStatus[data.status as keyof typeof UserStatus];
    if (!user.status) throw new ApolloError('badstatus');
    await user.save();
    return true;
  }

  async updateRoles(data: SetRolesInput) {
    let user = await User.findOne({ where: { id: data.id } });
    if (!user) throw new ApolloError('User non trovato');
    // TODO verify roles
    user.roles = data.roles || [];
    await user.save();
    return Object.assign(new UserResponse(), user) as UserResponse;
  }

  async login(email: string, password: string, ctx: GraphqlContext) {
    console.log(email, password);
    let user = await User.findOne({ where: { email }, relations: ['profile'] });
    if (!user) throw new ApolloError('login.usernotfound');
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new ApolloError('login.wrongcredentials');
    }
    const roles = new Roles();
    user.auth = roles.getAuth(user.roles);
    const session = Session.create();
    session.email = user.email;
    session.roles = user.roles;
    session.auth = user.auth;
    // use extra for session.add(key:value) and session.get(key)
    const result = await session.save();
    const token = generateAccessToken(<AccessTokenData>{ session: result.id });
    return { token: token, user: user };
  }

  async logout(uuid: string, ctx: GraphqlContext): Promise<Boolean> {
    if (!ctx.sessionId) {
      return true;
    }
    const session = await Session.findOne({ id: ctx.sessionId });
    if (session) {
      session.logout = new Date();
      await session.save();
    }
    console.log('session', session);
    return true;
  }

  async delete(id: string) {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new ApolloError('User non trovato');
    await user.remove();
    return true;
  }

  public async recoverPassword(email: string): Promise<string> {
    // TODO verify email, return error, send mail welcome
    try {
      console.log(email);
      await this.EmailValidation(email);

      const user = await User.findOne({ where: { email: email } });
      console.log(user);
      if (!user) {
        // resend email
        throw 'recoverpassword.notexist';
      }

      const token = new ValidationToken();
      const tk = await token.generate(ValidationTokenType.recoverPassword, email, user.id, 5);
      console.log(tk);
      await sendRecoverPassword(email, { token: tk });
      return '';
    } catch (error) {
      console.log(error);
      throw new ApolloError(error as string);
    }
  }

  async validateRecover(token: string): Promise<Boolean> {
    let vt = await ValidationToken.findOne({ where: { token: token } });
    if (!vt) {
      throw new ApolloError('validate.tokennotvalid');
    }
    if (vt.expire < new Date()) {
      throw new ApolloError('validate.tokenexpired');
    }
    if (vt.fired) {
      throw new ApolloError('validate.tokenfired');
    }
    let user = await User.findOne({ where: { email: vt.email } });
    const result = <ISocialsDataResponse>{};
    // normalize data
    if (!user) {
      throw new ApolloError('validate.usernotexist');
    }
    vt.fired = new Date();
    vt.save();
    return true;
  }

  async setNewPassword(password: string, token: string, ctx: GraphqlContext): Promise<LoginResponse> {
    let vt = await ValidationToken.findOne({ where: { token: token } });
    if (!vt) {
      throw new ApolloError('validate.tokennotvalid');
    }
    if (!vt.fired) {
      throw new ApolloError('validate.tokennotfired');
    }
    let user = await User.findOne({ where: { email: vt.email } });
    if (!user) {
      throw new ApolloError('validate.usernotexist');
    }
    user.password = await bcrypt.hash(password, 10);
    user.save();

    const data = await this.login(user.email, password, ctx);

    return Object.assign(new LoginResponse(), data) as LoginResponse;
  }

  async savePreferences(preferences: UserPreferencesInput, ctx: GraphqlContext): Promise<boolean> {
    if (!ctx.user?.email) {
      return false;
    }
    const user = await User.findOne({ where: { email: ctx.user?.email } });
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    user.preferences = preferences;
    user.save();
    return true;
  }

  async saveUserPreferences(preferences: UserPreferencesInput, userId: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    user.preferences = preferences;
    user.save();
    return true;
  }

  public async nicknameExist(nickname: String, userId: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!user) {
      //TODO internal error user not found
      return true;
    }
    if (user.profile.nickname === nickname) {
      return false;
    }
    const profile = await Profile.findOne({ where: { nickname: nickname } });
    if (!profile) {
      return false;
    }
    return true;
  }

  async saveProfile(profile: UserProfileInput, ctx: GraphqlContext): Promise<boolean> {
    if (!ctx.user?.email) {
      return false;
    }
    const user = await User.findOne({ where: { email: ctx.user?.email }, relations: ['profile'] });
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    const id = user.profile.id;
    user.profile = profile as Profile;
    user.profile.id = id;
    user.save();
    return true;
  }

  async saveUserProfile(profile: UserProfileInput, userId: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: userId }, relations: ['profile'] });
    console.log(user, profile, userId);
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    const id = user.profile.id;
    user.profile = profile as Profile;
    user.profile.id = id;
    user.save();
    return true;
  }

  async saveSocials(socials: string, ctx: GraphqlContext): Promise<boolean> {
    if (!ctx.user?.email) {
      return false;
    }
    const user = await User.findOne({ where: { email: ctx.user?.email } });
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    user.socials = normalizeSocials(socials);
    user.save();
    return true;
  }

  async saveUserSocials(userId: string, socials: string): Promise<boolean> {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    user.socials = normalizeSocials(socials);
    user.save();
    return true;
  }

  async setUserPassword(data: UpdateUserPasswordInput): Promise<boolean> {
    const user = await User.findOne({ where: { id: data.userId } });
    if (!user) {
      //TODO internal error user not found
      return false;
    }
    const password = await bcrypt.hash(data.password, 10);
    user.password = password;
    user.save();
    return true;
  }
}
