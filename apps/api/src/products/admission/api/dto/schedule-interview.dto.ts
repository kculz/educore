import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ScheduleInterviewDto {
  @ApiProperty()
  @IsString()
  scheduledAt!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  location!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  interviewer!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

