import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OTP } from './schemas/otp.schema';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { OTPType } from './types/otp.type';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(OTP.name) private otpModel: Model<OTP>) {}

  async generateOtp(user: User, type: OTPType): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const otpDocument = new this.otpModel({
      userId: user._id,
      code: hashedOtp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 5 minutes
      used: false,
    });

    await otpDocument.save();

    return otp;
  }

  async getOtpByUserIdAndType(
    userId: string,
    type: OTPType,
  ): Promise<OTP | null> {
    return this.otpModel
      .findOne({ userId, type, used: false })
      .sort({ createdAt: -1 }) // Get the most recent OTP
      .exec();
  }

  async markOtpAsUsed(otpId: string): Promise<void> {
    await this.otpModel.findByIdAndUpdate(otpId, { used: true }).exec();
  }

  async markAllOtpsAsUsed(userId: string, type: OTPType) {
    await this.otpModel.updateMany(
      { userId, type, used: false },
      { $set: { used: true } },
    );
  }

  async validateOtp(
    userId: string,
    type: OTPType,
    otp: string,
  ): Promise<{ status: boolean; message: string }> {
    const otpRecord = await this.getOtpByUserIdAndType(userId, type);

    if (!otpRecord) {
      return {
        status: false,
        message: 'OTP Does not exists',
      }; // No OTP found
    }

    if (otpRecord.expiresAt < new Date()) {
      return { status: false, message: 'Expired OTP' }; // OTP has expired
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.code);
    if (!isMatch) {
      return { status: false, message: 'Invalid OTP' }; // OTP does not match
    }

    await this.markOtpAsUsed(otpRecord._id.toString());
    return {
      status: true,
      message: 'OTP verified successfully',
    }; // OTP is valid
  }
}
