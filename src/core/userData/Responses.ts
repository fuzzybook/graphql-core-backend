import { Field, Float, ObjectType } from 'type-graphql';
import { FileAttributes } from '../abstractFS/directoryTree';

@ObjectType()
export class FilesResponse {
  @Field((type) => String)
  path: string;
  @Field((type) => String)
  parent: string;
  @Field((type) => String)
  file: string;
}

@ObjectType()
export class FilesDirectoryAttributeResponse {
  @Field((type) => Float, { nullable: true, description: 'access date' })
  atimeMs: number;
  @Field((type) => Float, { nullable: true, description: 'update date' })
  ctimeMs: number;
  @Field((type) => Float, { nullable: true, description: 'creation date' })
  birthtimeMs: number;
}

@ObjectType()
export class FilesDirectoryResponse {
  @Field((type) => Float)
  size: number;
  @Field((type) => String)
  name: string;
  @Field((type) => String)
  path: string;
  @Field((type) => String, { nullable: true, description: 'extensions if not directory' })
  extension: string;
  @Field((type) => String)
  type: string;
  @Field((type) => FilesDirectoryAttributeResponse)
  attributes: FileAttributes;
  @Field((type) => [FilesDirectoryResponse], { nullable: true, description: 'files' })
  children: FilesDirectoryResponse[];
}
