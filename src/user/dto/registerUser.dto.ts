import { IsEmail, IsString, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  profilePicId?: string;

  @IsString()
  @IsOptional()
  accountStatus?: 'verified' | 'unverified' | 'suspended';
}
