import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OfferAdmissionDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  offerExpiresAt?: string | null;
}

