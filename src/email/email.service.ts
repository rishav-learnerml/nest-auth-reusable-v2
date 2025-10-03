import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  emailTransport() {
    const transport = {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
    return nodemailer.createTransport(transport);
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    const { recepients, subject, html } = sendEmailDto;

    const transporter = this.emailTransport();

    const options: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: recepients,
      subject: subject,
      html: html,
    };

    try {
      await transporter.sendMail(options);
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new ServiceUnavailableException('Email service is unavailable');
    }
  }
}
