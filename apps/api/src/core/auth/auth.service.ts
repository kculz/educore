import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PlatformConfigService } from '../../config/platform-config.service';
import { PlatformStateService } from '../platform-state/platform-state.service';
import type {
  JwtRefreshPayload,
  JwtUserPayload,
  PlatformUser,
} from '../platform-state/platform-state.types';
import { verifyPassword } from './password.util';
import { randomUUID } from 'node:crypto';

function parseDurationToMs(value: string) {
  const match = /^(\d+)(ms|s|m|h|d|w)$/.exec(value);
  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const scale: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return amount * scale[unit];
}

function parseDurationToSeconds(value: string) {
  return Math.max(1, Math.floor(parseDurationToMs(value) / 1000));
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(PlatformConfigService) private readonly config: PlatformConfigService,
    @Inject(PlatformStateService) private readonly platformState: PlatformStateService,
  ) {}

  async login(input: { tenantId: string; email: string; password: string }) {
    const user = this.platformState.getUserByEmail(input.tenantId, input.email);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = verifyPassword(input.password, {
      salt: user.passwordSalt,
      hash: user.passwordHash,
    });
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenPair = await this.issueTokenPair(user);
    this.platformState.markUserLogin(user.id);
    this.platformState.recordAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'auth.login',
      resource: 'auth',
      metadata: { email: user.email },
    });
    return {
      ...tokenPair,
      user: this.serializeUser(user.id),
    };
  }

  async refresh(input: { tenantId: string; refreshToken: string }) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(input.refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (payload.tenantId !== input.tenantId) {
        throw new UnauthorizedException('Tenant mismatch');
      }

      const user = this.platformState.getUserById(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.refreshTokenJti !== payload.jti) {
        throw new UnauthorizedException('Refresh token has been rotated');
      }

      const tokenPair = await this.issueTokenPair(user);
      this.platformState.recordAudit({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'auth.refresh',
        resource: 'auth',
        metadata: { email: user.email },
      });
      return {
        ...tokenPair,
        user: this.serializeUser(user.id),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  me(userId: string) {
    return this.serializeUser(userId);
  }

  listTenants() {
    return this.platformState
      .listTenants()
      .filter((tenant) => tenant.status === 'active')
      .map((tenant) => ({
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        enabledProducts: [...tenant.enabledProducts],
        status: tenant.status,
      }));
  }

  private async issueTokenPair(user: PlatformUser) {
    const accessPayload: JwtUserPayload = this.platformState.getJwtUserPayload(user);
    const refreshJti = randomUUID();
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      tokenType: 'refresh',
      jti: refreshJti,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.config.jwtAccessSecret,
      expiresIn: parseDurationToSeconds(this.config.jwtAccessExpiresIn),
    });
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.config.jwtRefreshSecret,
      expiresIn: parseDurationToSeconds(this.config.jwtRefreshExpiresIn),
    });

    const refreshExpiresAt = new Date(Date.now() + parseDurationToMs(this.config.jwtRefreshExpiresIn));
    this.platformState.setRefreshToken(user.id, refreshJti, refreshExpiresAt.toISOString());
    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.jwtAccessExpiresIn,
    };
  }

  private serializeUser(userId: string) {
    const user = this.platformState.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Unknown user');
    }

    const roleIds = [...user.roleIds];
    const permissions = new Set<string>();
    for (const roleId of roleIds) {
      const role = this.platformState.getRoleById(roleId);
      if (!role) continue;
      for (const permission of role.permissions) {
        permissions.add(permission);
      }
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roleIds,
      permissions: [...permissions],
      lastLoginAt: user.lastLoginAt,
    };
  }
}
