import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  name!: string;
}

