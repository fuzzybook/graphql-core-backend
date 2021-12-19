import { Resolver, Query, Arg, Authorized, Mutation } from 'type-graphql';
import dotenv from 'dotenv';
import mjml2html from 'mjml';
import { MJMLParseError } from 'mjml-core';
import { LocalFileSystemStorage, LocalFileSystemStorageConfig } from '../../abstractFS';
import { TemplatesParsingResponse } from '../Responses';

import { transactionalMail } from '../../../config/transactionalMail';
import { roles } from '../../roles/generated';
import { TreeRepositoryNotSupportedError } from 'typeorm';

dotenv.config({
  path: '.env',
});

const fsConfig = <LocalFileSystemStorageConfig>{
  root: process.env.FSSYSTEM,
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

  @Query(() => String)
  async transctionalMails() {
    try {
      return JSON.stringify(transactionalMail);
    } catch (e) {
      return { data: (e as Error).message };
    }
  }

  @Query(() => String)
  async getTransctionalMail(@Arg('template') template: string) {
    try {
      const filename = '/transactionalMail/' + transactionalMail.templates[template].fileName;
      if (await this.fs.exists(filename)) {
        const result = await this.fs.get(filename);
        return result.content;
      }
      const result = await this.fs.get('/transactionalMail/void.mjml');
      return result.content;
    } catch (e) {
      return { data: (e as Error).message };
    }
  }

  @Query(() => TemplatesParsingResponse)
  previewMJML(@Arg('template') template: string) {
    try {
      const htmlOutput = mjml2html(template, {});
      return { text: htmlOutput.html, errors: JSON.stringify(htmlOutput.errors) };
    } catch (e) {
      const errors: MJMLParseError[] = [];
      errors.push({
        line: 1,
        message: (e as Error).message,
        tagName: 'mjml',
        formattedMessage: '',
      });
      return { text: '', errors: JSON.stringify(errors) };
    }
  }

  @Authorized([roles.superadmin, roles.usersadmin, roles.supervisor])
  @Mutation(() => Boolean)
  async saveTransctionalMail(@Arg('template') template: string, @Arg('name') name: string) {
    console.log(name, template);
    try {
      const filename = '/transactionalMail/' + transactionalMail.templates[name].fileName;
      const result = await this.fs.put(filename, template);
      return true;
    } catch (e) {
      return { data: (e as Error).message };
    }
  }
}
