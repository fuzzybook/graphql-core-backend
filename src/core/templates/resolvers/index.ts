import { Resolver, Query, Arg } from 'type-graphql';
import dotenv from 'dotenv';
import mjml2html from 'mjml';
import { LocalFileSystemStorage, LocalFileSystemStorageConfig } from '../../abstractFS';
import { TemplatesParsingResponse, TemplatesResponse } from '../Responses';

dotenv.config({
  path: '.env',
});

const fsConfig = <LocalFileSystemStorageConfig>{
  root: process.env.FSTEMPLATES,
};

@Resolver()
export class FsTemplatesResolver {
  private fs: LocalFileSystemStorage;
  constructor() {
    try {
      this.fs = new LocalFileSystemStorage(fsConfig);
    } catch (e) {
      console.log((e as Error).message);
    }
  }

  @Query(() => String)
  async templatesTree(@Arg('path') path: string) {
    try {
      const tree = this.fs.treeList(path);
      return JSON.stringify(tree);
    } catch (e) {
      return { data: (e as Error).message };
    }
  }

  @Query(() => String)
  async getTemplate(@Arg('path') path: string) {
    try {
      const result = await this.fs.get(path);
      return result.content;
    } catch (e) {
      return { data: (e as Error).message };
    }
  }

  // TODO wrong implementation do recursive types
  @Query(() => TemplatesResponse)
  async templatesDirectory(@Arg('path') path: string) {
    try {
      const result = this.fs.directoryList(path, /\.(mjml|js|html)$/);
      const template = <TemplatesResponse>{};
      const test = Object.assign(template, result);
      console.log(test);
      return test;
    } catch (e) {
      return { data: (e as Error).message };
    }
  }

  @Query(() => TemplatesParsingResponse)
  async previewMJML(@Arg('template') template: string) {
    try {
      const htmlOutput = mjml2html(template, { validationLevel: 'strict' });
      return { text: htmlOutput.html, error: false };
    } catch (e) {
      console.log(e);
      return { text: e, error: true };
    }
  }
}
