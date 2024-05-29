import type { SentMessageInfo } from 'nodemailer';
import { respondEmailTemplate } from '~/emails/getEmailTemplate';
import type { IData } from '~/interfaces/global';
import transporter from '~/lib/nodemailer';
// import transporter from '@/lib/nodemailer';

export type SendMailCodes = 200;

interface IInfo {
  accepted: string[]; // ['any@gmail.com'];
  rejected: string[];
  ehlo: any;
  // ehlo: [
  // 	'SIZE 35882577',
  // 	'8BITMIME',
  // 	'AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH',
  // 	'ENHANCEDSTATUSCODES',
  // 	'PIPELINING',
  // 	'CHUNKING',
  // 	'SMTPUTF8',
  // ];
  envelopeTime: number; //285;
  messageTime: number; //526;
  messageSize: number; //294;
  response: string; // '250 2.0.0 OK  1711364587 6-20020a05651c008600b002d2e6b98ca5sm1413164ljq.135 - gsmtp';
  envelope: {
    from: string; //'someUserFrom@nexamind.partners';
    to: string; // ['someUserTo@gmail.com'];
  };
  messageId: string; // '<4c6d2739-2cca-85fc-992e-ab6900bae24d@nexamind.partners>';
}

export interface IPostData {
  subject: string;
  text: string;
  to: string;
  toMeData: IData;
}

export interface ISendMailResponse {
  code: SendMailCodes;
  message: string;
}

export default async function sendBookingEmail(data: IPostData) {
  const { subject, to, toMeData } = data;

  const mailOptions = {
    subject: `👋 ${subject}`,
    from: process.env.NUXT_MAIL_USERNAME,
    sender: 'Yurii Kyrylovskyi',
    to: [to], // The person you want your email to be sent
    html: respondEmailTemplate(),
  };

  const myMailOptions = {
    subject: `🦊 ${subject} 🦊`,
    from: process.env.NUXT_MAIL_USERNAME,
    sender: 'Yurii Kyrylovskyi',
    to: [process.env.NUXT_MAIL_USERNAME as string], // The person you want your email to be sent
    text: `from: ${to}
						${toMeData.question}`,
  };

  transporter.sendMail(myMailOptions);

  return new Promise((resolve, reject) => {
    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          return reject(new Error('Unable to send email')); // gives 500 Next server error
        }

        const message = `Message delivered to ${info.accepted}`;
        return resolve({ code: 200, message } as ISendMailResponse);
      }
    );
  });
}
