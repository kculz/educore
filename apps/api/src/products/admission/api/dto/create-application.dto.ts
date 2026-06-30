import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  applicantId!: string;

  @ApiProperty()
  @IsString()
  programmeId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  cycleId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3)
  submissionNotes?: string | null;
}

