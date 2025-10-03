import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../auth/role.types';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'avatar' })
  profilePicId?: string;

  @Prop({ default: Role.User })
  role: string;

  @Prop({ default: 'unverified' })
  accountStatus?: 'verified' | 'unverified' | 'suspended';
}

export const UserSchema = SchemaFactory.createForClass(User);
