import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import dotenv from 'dotenv';
import { LocalFileSystemStorage, LocalFileSystemStorageConfig } from '../../abstractFS';
import { FilesDirectoryResponse } from '../Responses';

dotenv.config({
  path: '.env',
});

const fsConfig = <LocalFileSystemStorageConfig>{
  root: process.env.FSUSERDATA,
};

@Resolver()
export class FsUserDataController {
  private fs: LocalFileSystemStorage;
  constructor() {
    try {
      this.fs = new LocalFileSystemStorage(fsConfig);
    } catch (e) {
      console.log((e as Error).message);
      throw 'localstorage.notavaible';
    }
  }

  @Query(() => String)
  async userDataGetFile(@Arg('path') path: string) {
    console.log(path);
    try {
      const result = await this.fs.get(path);
      if (!result) {
        return new Error('localstorage.notavaible');
      }
      return result.content;
    } catch (e) {
      return e as Error;
    }
  }

  @Query(() => FilesDirectoryResponse)
  async userDataFilesDirectory(@Arg('path') path: string) {
    console.log(path);
    try {
      const result = this.fs.treeList(path);
      if (!result) {
        return new Error('localstorage.notavaible');
      }
      const test = Object.assign(new FilesDirectoryResponse(), result);
      return test;
    } catch (e) {
      console.log(e);
      return e as Error;
    }
  }

  @Mutation(() => Boolean)
  async userDataSetFile(@Arg('path') path: string, @Arg('data') data: string): Promise<Boolean | Error> {
    try {
      const { exists } = await this.fs.exists(path);
      if (!exists) {
        return new Error('localstorage.filenotexists');
      }
      const result = await this.fs.put(path, data);
      if (!result) {
        return new Error('localstorage.writeerror');
      }
      return true;
    } catch (e) {
      return e as Error;
    }
  }
}
