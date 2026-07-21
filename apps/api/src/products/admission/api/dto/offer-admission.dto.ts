import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { IsTrimmedString } from '../../../../shared/validators/trimmed-string.validator';

export class OfferAdmissionDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsTrimmedString()
  offerExpiresAt?: string | null;
}
