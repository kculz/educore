import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateTenantProductsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  enabledProducts!: string[];
}

