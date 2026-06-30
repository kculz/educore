import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PlatformConfigModule } from '../../config/platform-config.module';
import { PlatformConfigService } from '../../config/platform-config.service';
import { PlatformStateModule } from '../platform-state/platform-state.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PlatformConfigModule,
    PlatformStateModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [PlatformConfigService],
      useFactory: (config: PlatformConfigService) => ({
        secret: config.jwtAccessSecret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
