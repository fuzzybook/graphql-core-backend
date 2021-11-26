import { Field, ObjectType } from 'type-graphql';

export enum UserStatus {
  waiting = 'waiting',
  operating = 'operating',
  suspended = 'suspended',
  banned = 'banned',
}

@ObjectType()
export class ProfileResponse {
  @Field(() => String, { nullable: true })
  nickname?: string;
  @Field(() => String, { nullable: true })
  title?: string;
  @Field(() => String, { nullable: true })
  firstName?: string;
  @Field(() => String, { nullable: true })
  lastName?: string;
  @Field(() => String, { nullable: true })
  phoneNumber?: string;
  @Field(() => String, { nullable: true })
  mobileNumber?: string;
  @Field(() => String, { nullable: true })
  address1?: string;
  @Field(() => String, { nullable: true })
  address2?: string;
  @Field(() => String, { nullable: true })
  zip?: string;
  @Field(() => String, { nullable: true })
  city?: string;
  @Field(() => String, { nullable: true })
  country?: string;
}

@ObjectType()
export class UserPreferences {
  @Field(() => Boolean)
  useIdle: boolean;
  @Field(() => Number)
  idleTimeout: number;
  @Field(() => Boolean)
  useIdlePassword: boolean;
}

@ObjectType()
export class UserResponse {
  @Field(() => String, { description: 'postgres uuid v4' })
  id: string;
  @Field(() => UserStatus, { description: 'user status scalar UserStatus' })
  status: UserStatus;
  @Field(() => String, { description: 'user email' })
  email: string;
  @Field(() => String, { nullable: true, description: 'user name by profile' })
  username: string;
  @Field(() => [String], { description: 'user roles' })
  roles: string;
  @Field(() => Number, { nullable: true, description: 'user roles binary' })
  auth: number;
  @Field(() => Date, { nullable: true, description: 'creation date' })
  created: Date;
  @Field(() => Date, { nullable: true, description: 'last update date' })
  updated: Date;
  @Field((type) => ProfileResponse, { nullable: true, description: 'user profile' })
  profile: ProfileResponse;
  @Field(() => String, { nullable: true, description: 'extra data' })
  extra: string;
  @Field(() => String, { nullable: true, description: 'extra data schema' })
  extraSchema: string;
  @Field((type) => UserPreferences, { nullable: true, description: 'user preferences' })
  preferences: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => String, { description: 'token' })
  token: string;
  @Field(() => UserResponse, { description: 'user data' })
  user: UserStatus;
}
