import { IsUUID } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { UserStatus } from './Responses';

@InputType()
export class SetRolesInput {
  @Field(() => String)
  id: string;
  @Field(() => [String])
  roles: string[];
}

@InputType()
export class UserProfileInput {
  @Field(() => String, { nullable: true, description: 'prova con erdo' })
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

@InputType()
export class UserInput {
  @Field(() => UserStatus, { defaultValue: UserStatus.waiting })
  status?: UserStatus;
  @Field(() => String)
  email: string;
  @Field(() => String)
  password: string;
  @Field((type) => UserProfileInput, { nullable: true })
  profile?: UserProfileInput;
}

@InputType()
export class UpdateUserInput {
  @IsUUID('4')
  @Field()
  id: string;
  @Field(() => UserStatus, { nullable: true })
  status?: UserStatus;
  @Field((type) => UserProfileInput, { nullable: true })
  profile?: UserProfileInput;
}

@InputType()
export class UpdateUserStatusInput {
  @IsUUID('4')
  @Field()
  id: string;
  @Field()
  status: string;
}

@InputType()
export class UpdatePasswordInput {
  @Field()
  password: string;
}

@InputType()
export class UpdateUserPasswordInput {
  @Field(() => String)
  userId: string;
  @Field(() => String)
  password: string;
}

@InputType()
export class RecoverPasswordInput {
  @Field()
  password: string;
  @Field()
  token: string;
}

@InputType()
export class UserPreferencesInput {
  @Field(() => Boolean, { defaultValue: false })
  useIdle: boolean;
  @Field(() => Number, { defaultValue: 3000 })
  idleTimeout: number;
  @Field(() => Boolean, { defaultValue: false })
  useIdlePassword: boolean;
}
