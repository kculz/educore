import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsString } from 'class-validator';

export class StoreFileDto {
  @ApiProperty()
  @IsString()
  filename!: string;

  @ApiProperty()
  @IsString()
  contentType!: string;

  @ApiProperty({
    description: 'Base64 encoded file contents',
  })
  @IsBase64()
  base64!: string;
}

