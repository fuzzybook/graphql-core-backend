import { Resolver, Query, Mutation, Arg, Authorized, Ctx } from 'type-graphql';

import uuidValidate from 'uuid-validate';
import { LoginResponse, UserResponse, UserStatus } from '../Responses';
import { UserProfileInput, SetRolesInput, UpdateUserInput, UpdateUserStatusInput, UserInput, UserPreferencesInput } from '../Inputs';
import dotenv from 'dotenv';
import { LocalFileSystemStorage, LocalFileSystemStorageConfig } from '../../abstractFS/LocalFileSystemStorage';
import { GraphqlContext } from '../../../sever/auth';
import { User } from '../models/User';
import { DEFAULT_ROLE, ROLESADMIN, RoleType, SUPERADMIN } from '../../../config/roles';
import Roles from '../../roles/controllers/RolesClass';
import { IRolesResponse } from '../../roles/Responses';
import { UserController } from '../controllers/User';
dotenv.config({
  path: '.env',
});

const fsConfig = <LocalFileSystemStorageConfig>{
  root: process.env.DATAROOT,
};

@Resolver()
export class UserResolver {
  private userController: UserController;

  private autoIncrement = 0;

  constructor() {
    this.userController = new UserController();
    console.log('UserResolver start');
  }

  @Query(() => Boolean)
  async heartbeat(@Ctx() ctx: GraphqlContext) {
    // uare per inviare serials ecc
    return ctx.user ? true : false;
  }

  @Query(() => UserResponse)
  async user(@Arg('id') id: string) {
    if (!uuidValidate(id, 4)) {
      throw new Error('usererror.invalidid');
    }
    return this.userController.findByID(id);
  }

  @Query(() => UserResponse, { nullable: true })
  async me(@Ctx() ctx: GraphqlContext) {
    return this.userController.me(ctx);
  }

  @Query(() => Boolean)
  async alive(@Ctx() ctx: GraphqlContext) {
    return this.userController.alive(ctx);
  }

  @Query(() => String)
  async avatar(@Arg('id') id: string) {
    if (!uuidValidate(id, 4)) {
      throw new Error('usererror.invalidid');
    }
    try {
      const fs = new LocalFileSystemStorage(fsConfig);
      const { exists } = await fs.exists(`/users/${id}/avatar.b64image`);
      if (!exists) {
        const { exists } = await fs.exists(`/users/defaultAvatar.png`);
        if (!exists) {
          return new Error('localstorage.filenotexists');
        }
        const img = await fs.get('/users/defaultAvatar.png', 'base64');
        return `data:image/png;base64,${img.raw}`;
      }
      const result = await fs.get(`/users/${id}/avatar.b64image`);
      return result.content;
    } catch (e) {
      console.log((e as Error).message);
      throw 'localstorage.notavaible';
    }
  }

  @Query(() => Boolean, { nullable: true })
  async nicknameExist(@Arg('nickname') nickname: string, @Ctx() ctx: GraphqlContext) {
    return this.userController.nicknameExist(nickname, ctx);
  }

  @Mutation(() => Boolean)
  async saveAvatar(@Arg('id') id: string, @Arg('avatar') avatar: string): Promise<Boolean | Error> {
    try {
      const fs = new LocalFileSystemStorage(fsConfig);
      const result = await fs.put(`/users/${id}/avatar.b64image`, avatar);
      if (!result) {
        return new Error('localstorage.writeerror');
      }
      return true;
    } catch (e) {
      return e as Error;
    }
  }

  @Mutation(() => Boolean)
  async validateActivation(@Arg('token') token: string): Promise<Boolean> {
    return this.userController.validateActivation(token);
  }

  @Mutation(() => String)
  async createUser(@Arg('data') data: UserInput) {
    return this.userController.create(data);
  }

  @Mutation(() => UserResponse)
  async update(@Arg('data') data: UpdateUserInput) {
    return this.userController.update(data);
  }

  @Mutation(() => Boolean)
  async updateStatus(@Arg('data') data: UpdateUserStatusInput): Promise<Boolean> {
    return this.userController.updateStatus(data);
  }

  @Mutation(() => LoginResponse)
  async login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() ctx: GraphqlContext) {
    return this.userController.login(email, password, ctx);
  }

  @Mutation(() => Boolean)
  async logout(@Arg('uuid') uuid: string, @Ctx() ctx: GraphqlContext): Promise<Boolean> {
    return this.userController.logout(uuid, ctx);
  }

  @Mutation(() => Boolean)
  async saveProfile(@Arg('profile') profile: UserProfileInput, @Ctx() ctx: GraphqlContext): Promise<Boolean> {
    return this.userController.saveProfile(profile, ctx);
  }

  // Recover password

  @Mutation(() => String)
  async recoverPassword(@Arg('email') email: string) {
    return this.userController.recoverPassword(email);
  }

  @Mutation(() => LoginResponse)
  async setNewPassword(@Arg('password') password: string, @Arg('token') token: string, @Ctx() ctx: GraphqlContext) {
    return this.userController.setNewPassword(password, token, ctx);
  }

  @Mutation(() => Boolean)
  async validateRecover(@Arg('token') token: string): Promise<Boolean> {
    return this.userController.validateRecover(token);
  }
  @Authorized()
  @Mutation(() => Boolean)
  async savePreferences(@Arg('preferences') preferences: UserPreferencesInput, @Ctx() ctx: GraphqlContext): Promise<Boolean> {
    return this.userController.savePreferences(preferences, ctx);
  }

  // ADMIN ONLY

  @Authorized([SUPERADMIN, 'SUPERVISOR'])
  @Query(() => [UserResponse])
  async users() {
    return this.userController.getAll();
  }

  @Authorized([SUPERADMIN, ROLESADMIN, 'SUPERVISOR'])
  @Mutation(() => Boolean)
  async delete(@Arg('uuid') id: string) {
    return this.userController.delete(id);
  }

  @Authorized([SUPERADMIN, ROLESADMIN, 'SUPERVISOR'])
  @Mutation(() => UserResponse)
  async setRoles(@Arg('data') data: SetRolesInput) {
    return this.userController.updateRoles(data);
  }
}
