import nodemailer from 'nodemailer';

const ENVIRONMENTS = {
  GMAIL_APP_USERNAME: process.env.NUXT_MAIL_USERNAME || '',
  GMAIL_APP_PASSWORD: process.env.NUXT_MAIL_PASSWORD || '',
};

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: ENVIRONMENTS.GMAIL_APP_USERNAME,
    pass: ENVIRONMENTS.GMAIL_APP_PASSWORD,
  },
});

export default transporter;
