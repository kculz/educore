import { ApiProperty } from '@nestjs/swagger';
import { IsTrimmedString } from '../../../shared/validators/trimmed-string.validator';

export class UpdateSettingDto {
  @ApiProperty()
  @IsTrimmedString()
  value!: string;
}
