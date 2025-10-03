import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './course/course.module';
import { EmailService } from './email/email.service';
import { EmailController } from './email/email.controller';
import { EmailModule } from './email/email.module';
import { OtpService } from './otp/otp.service';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule,
    UserModule,
    CourseModule,
    EmailModule,
    OtpModule,
  ],
  controllers: [AppController, EmailController],
  providers: [AppService, EmailService],
})
export class AppModule {}
