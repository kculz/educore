import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class CreateQueueJobDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;
}

