import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OTPType } from '../types/otp.type';
import { User } from 'src/user/schemas/user.schema';

export type OTPDocument = HydratedDocument<OTP>;

@Schema({ timestamps: true })
export class OTP {
  _id: Types.ObjectId;
  // Reference to User collection
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: OTPType })
  type: OTPType;

  // Expiry is dynamic (e.g. 5m for login, 15m for reset)
  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);
