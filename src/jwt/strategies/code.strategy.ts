import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';

@Injectable()
export class CodeStrategy extends PassportStrategy(Strategy, 'code') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.BETA_CODE,
    });
  }

  async validate(payload: TokenPayloadInterface) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
