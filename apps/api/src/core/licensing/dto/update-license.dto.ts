import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateLicenseDto {
  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiresAt?: string | null;
}

