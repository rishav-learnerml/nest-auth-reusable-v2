import { Injectable } from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/user/schemas/user.schema';
import { OTPType } from './types/otp.type';
import { SendEmailDto } from 'src/email/dto/email.dto';
import { OTP_TEMPLATE } from 'src/constants/otpTemplate.constant';

@Injectable()
export class OtpEmailService {
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate an OTP for the user and send it via email using EmailService.
   * Returns the plain OTP string that was sent.
   */
  async generateAndSendOtp(user: User, otpType: OTPType): Promise<string> {
    const otp = await this.otpService.generateOtp(user, otpType);

    const sendEmailDto: SendEmailDto = {
      recepients: [user.email],
      subject: OTP_TEMPLATE.verify_email.subject,
      html: OTP_TEMPLATE.verify_email.getHtml(user.firstname, otp),
    };

    await this.emailService.sendEmail(sendEmailDto);

    return otp;
  }
}
