import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  status!: 'active' | 'invited' | 'disabled';

  @ApiProperty({ type: [String] })
  roleIds!: string[];

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiProperty({ nullable: true })
  lastLoginAt!: string | null;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  expiresIn!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
