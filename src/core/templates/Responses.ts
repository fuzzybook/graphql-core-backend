import { Field, Float, ObjectType } from 'type-graphql';
import { FileAttributes } from '../abstractFS/directoryTree';

@ObjectType()
export class TemplatesResponse {
  @Field((type) => String)
  path: string;
  @Field((type) => String)
  parent: string;
  @Field((type) => String)
  file: string;
}
