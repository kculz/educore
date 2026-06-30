import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AccessScope, PublicRoute } from '../platform-access/platform-access.decorator';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Request } from 'express';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
    productCode: string;
  };
  user?: {
    sub: string;
  };
};

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @PublicRoute()
  @AccessScope({ productCode: 'platform' })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Req() request: RequestWithContext, @Body() dto: LoginDto) {
    return this.authService.login({
      tenantId: request.platformContext?.tenantId ?? request.header('x-tenant-id') ?? '',
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('refresh')
  @PublicRoute()
  @AccessScope({ productCode: 'platform' })
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(@Req() request: RequestWithContext, @Body() dto: RefreshTokenDto) {
    return this.authService.refresh({
      tenantId: request.platformContext?.tenantId ?? request.header('x-tenant-id') ?? '',
      refreshToken: dto.refreshToken,
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @AccessScope({ productCode: 'platform', permission: 'auth.me' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@Req() request: RequestWithContext) {
    return this.authService.me(request.user?.sub ?? '');
  }
}
