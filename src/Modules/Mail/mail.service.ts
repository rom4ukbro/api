import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const nodemailer = require('nodemailer');

@Injectable()
export class MailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({ 
      // host: 'tochkarosta.info',//process.env.MAIL_HOST,
      // host: 'mail-smtp',//process.env.MAIL_HOST,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendEmailApprovement(email: string[], href: string, userName: string) {
    let template = fs.readFileSync(path.join( __dirname, '..', '..', '..', 'static','mail','registration.html')).toString();
    template = template
              .replace(/{{activate_link}}/g, href)
              .replace(/{{user_name}}/g, userName);

    return await this.transporter.sendMail({
      from: process.env.MAIL_EMAIL,
      to: email[0],
      subject: 'Подтверждение вашей электронной почты',
      text: 'Сообщение',
      html: template,
    });
  }

  async passRecovery(email: [string], href: string) {
    let template = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'static', 'mail', 'resetPassword.html')).toString();
    template = template.replace(/{{activate_link}}/g, href);

    return await this.transporter.sendMail({
      from: process.env.MAIL_EMAIL,
      to: email,
      subject: 'Сброс пароля',
      text: '',
      html: template,
    });
  }
  
  async sendEmail(
    email: string[],
    title: string,
    text: string,
    link?: string,
  ) {
    let template = fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'static',
          'mail',
          'mailing.html',
        ),
      )
      .toString();
    template = template.replace(/{{title}}/g, title).replace(/{{text}}/g, text);
    !!link ? (template = template.replace(/{{link}}/g, link)) : 0;

    return this.transporter.sendMail({
      from: process.env.MAIL_EMAIL,
      to: email,
      subject: title,
      text: '',
      html: template,
    });
  }

}
