import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies['refresh-token'] as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayloadInterface) {
    const refreshToken = request?.cookies['refresh-token'] as string;
    return await this.authService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload,
    );
  }
}
