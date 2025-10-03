import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from './schemas/otp.schema';
import { OtpService } from './otp.service';
import { OtpEmailService } from './otp-email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OTP.name, schema: OTPSchema }]),
    EmailModule,
  ],
  providers: [OtpService, OtpEmailService],
  exports: [OtpService, OtpEmailService],
  controllers: [],
})
export class OtpModule {}
