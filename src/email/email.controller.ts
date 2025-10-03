import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/email.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(AuthGuard)
  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    await this.emailService.sendEmail(sendEmailDto);
  }
}
