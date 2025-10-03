import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from 'src/user/dto/registerUser.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { OtpService } from 'src/otp/otp.service';
import { OtpEmailService } from 'src/otp/otp-email.service';
import { OTPType } from 'src/otp/types/otp.type';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly otpService: OtpService,
    private readonly otpEmailService: OtpEmailService,
  ) {}

  /**
   * Create a new user.
   */
  async createUser(registerUserDto: RegisterUserDto): Promise<User> {
    try {
      return await this.userModel.create(registerUserDto);
    } catch (error: any) {
      this.logger.error(`Error creating user: ${error.message}`);

      if (error.code === 11000) {
        throw new ConflictException(
          'User with this email already exists. Please login to continue.',
        );
      }
      throw new InternalServerErrorException('Unable to create user.');
    }
  }

  /**
   * Find user by email.
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error: any) {
      this.logger.error(
        `Error finding user by email (${email}): ${error.message}`,
      );
      throw new InternalServerErrorException('Unable to fetch user.');
    }
  }

  /**
   * Get user by id (without password).
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) throw new NotFoundException('User not found.');
      return user;
    } catch (error: any) {
      this.logger.error(`Error fetching user by id (${id}): ${error.message}`);
      throw new InternalServerErrorException('Unable to fetch user.');
    }
  }

  /**
   * Update user by id.
   */
  async updateUser(
    id: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    try {
      const updated = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .select('-password')
        .exec();

      if (!updated) throw new NotFoundException('User not found.');
      return updated;
    } catch (error: any) {
      this.logger.error(`Error updating user (${id}): ${error.message}`);
      throw new InternalServerErrorException('Unable to update user.');
    }
  }

  /**
   * Delete user by id.
   */
  async deleteUser(id: string): Promise<User | null> {
    try {
      const deleted = await this.userModel.findByIdAndDelete(id).exec();
      if (!deleted) throw new NotFoundException('User not found.');
      return deleted;
    } catch (error: any) {
      this.logger.error(`Error deleting user (${id}): ${error.message}`);
      throw new InternalServerErrorException('Unable to delete user.');
    }
  }

  /**
   * Verify OTP for a user.
   * Delegates validation to OtpService.
   */
  async verifyOtp(
    userId: string,
    inputOtp: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new UnauthorizedException('Invalid request.');

    try {
      await this.otpService.validateOtp(userId, OTPType.OTP, inputOtp);

      if (user.accountStatus !== 'verified') {
        user.accountStatus = 'verified';
        await user.save();
      }

      return { message: 'OTP verified successfully. Account is now verified.' };
    } catch (err) {
      this.logger.warn(
        `OTP verification failed for user ${userId}: ${(err as Error).message}`,
      );
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('OTP verification failed.');
    }
  }

  /**
   * Ensure user is verified.
   * If unverified and no valid OTP exists, generate & send one.
   */
  async verifyUserEmail(
    user: User,
    otpType: OTPType = OTPType.OTP,
  ): Promise<void> {
    if (!user) throw new UnauthorizedException('Invalid request.');
    if (user.accountStatus === 'verified') return;

    const existing = await this.otpService.getOtpByUserIdAndType(
      user._id.toString(),
      otpType,
    );

    if (!existing) {
      await this.otpEmailService.generateAndSendOtp(user, otpType);
      throw new UnauthorizedException(
        'A verification OTP has been sent to your email. Please verify to continue.',
      );
    }

    // If OTP exists but expired/invalid, otpService should not return it.
    // Just return so controller can prompt user to verify with OTP.
    return;
  }

  /**
   * Force resend OTP for unverified user.
   */
  async resendOtp(
    userId: string,
    otpType: OTPType = OTPType.OTP,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found.');
    if (user.accountStatus === 'verified') {
      throw new ConflictException('Account already verified.');
    }

    // Invalidate all existing OTPs for this user/type
    await this.otpService.markAllOtpsAsUsed(user._id.toString(), otpType);

    // Generate and send a fresh OTP
    await this.otpEmailService.generateAndSendOtp(user, otpType);
  }
}
