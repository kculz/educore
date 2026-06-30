import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ enum: ['active', 'invited', 'disabled'] })
  @IsOptional()
  @IsIn(['active', 'invited', 'disabled'])
  status?: 'active' | 'invited' | 'disabled';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  roleIds?: string[];
}

