export interface TransactionalMailTemplate {
  [key: string]: { type: string; fileName: string };
}

export interface TransactionalMailConstants {
  [key: string]: string;
}
export interface TransactionalMail {
  constants: TransactionalMailConstants;
  templates: TransactionalMailTemplate;
}

export const transactionalMail: TransactionalMail = {
  constants: {},
  templates: {
    activation: {
      type: 'template',
      fileName: 'activation.mjml',
    },
    assigned: {
      type: 'template',
      fileName: 'assigned.mjml',
    },
    confirmation: {
      type: 'template',
      fileName: 'confirmation.mjml',
    },
  },
};
