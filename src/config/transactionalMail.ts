import dotenv from 'dotenv';
dotenv.config({
  path: '.env',
});

export interface TransactionalMailTemplateVar {
  var: string;
  description?: string;
}

export interface TransactionalMailTemplate {
  [key: string]: { type: string; fileName: string; icon: string; vars?: TransactionalMailTemplateVar[]; subject?: string };
}

export interface TransactionalMailConstants {
  [key: string]: string;
}
export interface TransactionalMail {
  constants: TransactionalMailConstants;
  templates: TransactionalMailTemplate;
}

export const transactionalMail: TransactionalMail = {
  constants: {
    siteName: process.env.SITE_NAME || '',
    siteUrl: process.env.SITE_URL || '',
    siteSupport: process.env.SITE_SUPPORT || '',
    siteMail: process.env.SITE_MAIL || '',
    siteMailfrom: process.env.SITE_MAIL_FROM || '',
  },
  templates: {
    head: {
      type: 'part',
      fileName: 'head.mjml',
      icon: 'mediation',
    },
    footer: {
      type: 'part',
      fileName: 'footer.mjml',
      icon: 'mediation',
    },
    banner: {
      type: 'part',
      fileName: 'banner.mjml',
      icon: 'mediation',
    },
    activation: {
      type: 'template',
      fileName: 'activation.mjml',
      icon: 'article',
      vars: [
        { var: 'token', description: 'activation token' },
        { var: 'user', description: 'user name' },
      ],
      subject: 'Welcome to Fantaskipper comunity!',
    },
    assigned: {
      type: 'template',
      fileName: 'assigned.mjml',
      icon: 'article',
    },
    confirmation: {
      type: 'template',
      fileName: 'confirmation.mjml',
      icon: 'article',
    },
  },
};
