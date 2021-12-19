import nodemailer from 'nodemailer';
import fs from 'fs';
import mjml2html from 'mjml';
import ejs from 'ejs';
import { MailerResults } from '../models/Mailer';

export interface ActivationData {
  name: string;
  token: string;
}

export interface ResetPasswordData {
  token: string;
}

// TODO move in configuration file
export const sendMailConfig = {
  site: 'FANTASKIPPER',
  siteUrl: 'http://localhost:8080',
  templateBase: '/home/fabio/CODE/GRAPHQL/FANTASKIPPER/graphql-fantaskipper-backend/FS_system',
  from: '"Fantaskipper" <noreplay@fantaskipper.com>',
  activation: {
    subject: 'Welcome to Fantaskipper comunity!',
    file: 'activation.mjml',
    data: <ActivationData>{
      name: '',
      token: '',
    },
  },
  reset: {
    subject: 'Fantaskipper comunity - recover password',
    file: 'reset.mjml',
    data: <ResetPasswordData>{
      token: '',
    },
  },
};

export const sendActivation = async (email: string, data: ActivationData) => {
  const file = `${sendMailConfig.templateBase}/${sendMailConfig.activation.file}`;
  //TODO verify parameters
  const params = {
    name: data.name,
    url: `${sendMailConfig.siteUrl}/?#/activate/${data.token}`,
    site: sendMailConfig.site,
    siteUrl: sendMailConfig.siteUrl,
  };
  await sendMail(file, email, params, sendMailConfig.activation.subject);
};

export const sendRecoverPassword = async (email: string, data: ResetPasswordData) => {
  const file = `${sendMailConfig.templateBase}/${sendMailConfig.reset.file}`;
  //TODO verify parameters
  const params = {
    url: `${sendMailConfig.siteUrl}/?#/recover/${data.token}`,
    site: sendMailConfig.site,
    siteUrl: sendMailConfig.siteUrl,
  };
  await sendMail(file, email, params, sendMailConfig.reset.subject);
};

export const sendMail = async (file: string, email: string, params: { [key: string]: string }, subject: string) => {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const data = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
  const template = ejs.render(data, params);
  const mjmlToHtml = mjml2html(template, { validationLevel: 'skip' });
  if (mjmlToHtml.errors.length > 0) {
    console.log(mjmlToHtml.errors);
  } else {
    let info = await transporter.sendMail({
      from: sendMailConfig.from, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: mjmlToHtml.html, // html body
    });

    const data = {
      email: email,
      info: info,
      file: file,
      params: params,
      subject: subject,
      text: mjmlToHtml.html,
    };

    const result = MailerResults.create(data);
    result.save();

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

const matches = (text: string, pattern: RegExp) => ({
  [Symbol.iterator]: function* () {
    const clone = new RegExp(pattern.source, pattern.flags);
    let match = null;
    do {
      match = clone.exec(text);
      if (match) {
        yield match;
      }
    } while (match);
  },
});

export const extractAllVars = (file: string) => {
  const data = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });

  const re = /\(\(var:..*\)\)/g;
  for (const match of matches(data, re)) {
    console.log(match[0]);
  }
};
