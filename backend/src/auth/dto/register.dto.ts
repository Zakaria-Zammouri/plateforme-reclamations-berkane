import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {

  @IsString()
  nom!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  role?: string;
}