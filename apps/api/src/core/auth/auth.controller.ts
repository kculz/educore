import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AccessScope, AnonymousRoute, PublicRoute } from '../platform-access/platform-access.decorator';
import { CurrentTenantId, CurrentUserId } from '../platform-access/platform-request.decorator';
import { AuthResponseDto, AuthTenantDto, AuthUserDto } from './dto/auth-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get('tenants')
  @AnonymousRoute()
  @ApiOkResponse({ type: AuthTenantDto, isArray: true })
  tenants() {
    return this.authService.listTenants();
  }

  @Post('login')
  @PublicRoute()
  @AccessScope({ productCode: 'platform' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@CurrentTenantId() tenantId: string | null, @Body() dto: LoginDto) {
    return this.authService.login({
      tenantId: tenantId ?? '',
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('mfa/verify')
  @PublicRoute()
  @AccessScope({ productCode: 'platform' })
  verifyMfaLogin(@CurrentTenantId() tenantId: string | null, @Body() dto: { userId: string; code: string }) {
    return this.authService.verifyMfaLogin({
      tenantId: tenantId ?? '',
      userId: dto.userId,
      code: dto.code,
    });
  }

  @Post('mfa/setup')
  @ApiBearerAuth()
  @AccessScope({ productCode: 'platform', permission: 'auth.me' })
  setupMfa(@CurrentUserId() userId: string | null) {
    return this.authService.setupTotp(userId ?? '');
  }

  @Post('mfa/enable')
  @ApiBearerAuth()
  @AccessScope({ productCode: 'platform', permission: 'auth.me' })
  enableMfa(@CurrentUserId() userId: string | null, @Body() dto: { code: string }) {
    return this.authService.enableTotp(userId ?? '', dto.code);
  }

  @Post('mfa/disable')
  @ApiBearerAuth()
  @AccessScope({ productCode: 'platform', permission: 'auth.me' })
  disableMfa(@CurrentUserId() userId: string | null) {
    return this.authService.disableTotp(userId ?? '');
  }

  @Post('refresh')
  @PublicRoute()
  @AccessScope({ productCode: 'platform' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(@CurrentTenantId() tenantId: string | null, @Body() dto: RefreshTokenDto) {
    return this.authService.refresh({
      tenantId: tenantId ?? '',
      refreshToken: dto.refreshToken,
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @AccessScope({ productCode: 'platform', permission: 'auth.me' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@CurrentUserId() userId: string | null) {
    return this.authService.me(userId ?? '');
  }
}
