import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { OTPType } from 'src/otp/types/otp.type';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get logged-in user's profile
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    const user = await this.userService.getUserById(userId);

    return {
      message: 'User profile fetched successfully',
      user,
    };
  }

  /**
   * Update logged-in user's profile
   */
  @UseGuards(AuthGuard)
  @Patch('update')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
    );

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  /**
   * Delete logged-in user account
   */
  @UseGuards(AuthGuard)
  @Delete('delete')
  async deleteUser(@Request() req) {
    const userId = req.user.id;
    await this.userService.deleteUser(userId);

    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * Verify user account with OTP
   */
  @UseGuards(AuthGuard)
  @Post('verify-otp')
  async verifyOtp(@Body() body: { otp: string }, @Request() req) {
    const userId = req.user.id;
    const result = await this.userService.verifyOtp(userId, body.otp);

    return {
      ...result,
    };
  }

  /**
   * Resend verification OTP if user is still unverified
   */
  @UseGuards(AuthGuard)
  @Get('resend-otp')
  async resendOtp(@Request() req) {
    await this.userService.resendOtp(req.user.id, OTPType.OTP);

    return {
      message: 'A new OTP has been sent to your email.',
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const user = await this.userService.findUserByEmail(body.email);

    if (!user) {
      throw new NotFoundException('User with this email does not exist.');
    }
    
    await this.userService.verifyUserEmail(user, OTPType.RESET_LINK);

    return {
      message: 'A reset password link has been sent to your email!',
    };
  }
}
