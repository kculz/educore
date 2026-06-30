import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  code!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  permissions!: string[];
}
