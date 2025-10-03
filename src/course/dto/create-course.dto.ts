import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  instructor: string;

  @IsString()
  @IsNotEmpty()
  level: string;
  
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
