import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class TemplatesParsingResponse {
  @Field((type) => String)
  text: string;
  @Field((type) => String, { nullable: true })
  errors: string;
}
