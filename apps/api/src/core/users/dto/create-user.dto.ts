import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  roleIds?: string[];
}
