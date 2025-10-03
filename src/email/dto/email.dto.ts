import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail({}, { each: true })
  recepients: string[];

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  html: string;

  @IsOptional()
  @IsString()
  text?: string;
}
