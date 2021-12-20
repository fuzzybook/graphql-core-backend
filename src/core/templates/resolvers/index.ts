import { Resolver, Query, Arg, Authorized, Mutation } from 'type-graphql';
import dotenv from 'dotenv';
import path from 'path';
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

  async insertHead(content: string) {
    const filename = '/transactionalMail/testHead.mjml';
    const chk = await this.fs.exists(filename);
    if (chk.exists) {
      const result = await this.fs.get(filename);
      let pos = result.content.indexOf('<!--HEAD-->');
      let endpos = result.content.indexOf('<!--/HEAD-->');
      const txt = `${result.content.substring(0, pos + '<!--HEAD-->'.length)}
      ${content}
      ${result.content.substring(endpos)}`;
      return txt;
    }
  }

  @Query(() => String)
  async getTransctionalMail(@Arg('template') template: string) {
    try {
      const filename = '/transactionalMail/' + transactionalMail.templates[template].fileName;
      const chk = await this.fs.exists(filename);
      if (chk.exists) {
        const result = await this.fs.get(filename);
        /* if (transactionalMail.templates[template].type == 'head') {
          return await this.insertHead(result.content);
        } */
        return result.content;
      }
      const result = await this.fs.get('/transactionalMail/void.mjml');
      return result.content;
    } catch (e) {
      return { data: (e as Error).message };
    }
  }

  @Query(() => TemplatesParsingResponse)
  previewMJML(@Arg('template') template: string, @Arg('type') type: string) {
    try {
      if (type == 'part') {
        return { text: '<b>fragments not rendered</b><br>import in template to test!', errors: JSON.stringify([]) };
      }
      const htmlOutput = mjml2html(template, { filePath: path.resolve(fsConfig.root, 'transactionalMail') });
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
