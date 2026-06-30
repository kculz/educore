import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PlatformConfigService } from '../../config/platform-config.service';
import type { JwtUserPayload } from '../platform-state/platform-state.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: PlatformConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtAccessSecret,
    });
  }

  validate(payload: JwtUserPayload) {
    return payload;
  }
}

