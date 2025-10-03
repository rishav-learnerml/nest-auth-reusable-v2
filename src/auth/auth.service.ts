import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from '../user/dto/registerUser.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/user/dto/loginUser.dto';
import { createClient, RedisClientType } from 'redis';
import { Response, Request } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { OtpService } from 'src/otp/otp.service';
import { OtpEmailService } from 'src/otp/otp-email.service';
import { EmailService } from 'src/email/email.service';
import { OTPType } from 'src/otp/types/otp.type';

@Injectable()
export class AuthService {
  private readonly redisClient: RedisClientType;

  private readonly accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  private readonly refreshTokenExpiry =
    process.env.REFRESH_TOKEN_EXPIRY || '3d';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
    private readonly otpEmailService: OtpEmailService,
  ) {
    this.redisClient = createClient({
      url: process.env.VALKEY_URL || 'redis://localhost:6379',
    });
    this.redisClient.connect();
  }

  private async generateTokens(payload: {
    id: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenExpiry,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.refreshTokenExpiry,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  private setRefreshTokenCookie(res: Response, refresh_token: string) {
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
      sameSite: 'strict',
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });
  }

  async registerUser(
    registerUserDto: RegisterUserDto,
    file: Express.Multer.File,
    res: Response,
  ) {
    const existingUser = await this.userService.findUserByEmail(
      registerUserDto.email,
    );

    if (existingUser) {
      throw new UnauthorizedException('Email is already in use.');
    }

    let profilePicId = 'avatar';

    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        // return uploadResult;
        profilePicId = uploadResult.public_id;
      } catch (error) {
        throw new UnauthorizedException('Profile picture upload failed.');
      }
    }

    const hash = await bcrypt.hash(registerUserDto.password, 10);

    const user = await this.userService.createUser({
      ...registerUserDto,
      profilePicId,
      password: hash,
    });

    const payload = { id: user._id.toString(), role: 'user' };
    const { access_token, refresh_token } = await this.generateTokens(payload);

    this.setRefreshTokenCookie(res, refresh_token);

    await this.otpEmailService.generateAndSendOtp(user, OTPType.OTP);

    return {
      message: 'User registered successfully and OTP sent to email!',
      access_token,
    };
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    const user = await this.userService.findUserByEmail(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { id: user._id.toString(), role: user.role };
    const { access_token, refresh_token } = await this.generateTokens(payload);

    this.setRefreshTokenCookie(res, refresh_token);

    return {
      message: 'User logged in successfully!',
      access_token,
      verified: user.accountStatus === 'verified',
    };
  }

  async refresh(req: Request, res: Response) {
    const refresh_token = req.cookies['refresh_token'];

    if (!refresh_token) {
      throw new UnauthorizedException('No refresh token provided.');
    }

    const isBlacklisted = await this.redisClient.get(refresh_token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token has been invalidated.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refresh_token);
      const newPayload = { id: payload.id, role: payload.role };

      const { access_token, refresh_token: new_refresh_token } =
        await this.generateTokens(newPayload);

      this.setRefreshTokenCookie(res, new_refresh_token);

      return {
        message: 'Token refreshed successfully!',
        access_token,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async logout(req: Request, res: Response) {
    const refresh_token = req.cookies['refresh_token'];

    if (refresh_token) {
      const expiry = 3 * 24 * 60 * 60; // 3 days in seconds
      await this.redisClient.set(refresh_token, 'blacklisted', { EX: expiry });
    }

    res.clearCookie('refresh_token');

    return {
      message: 'User logged out successfully!',
    };
  }
}
