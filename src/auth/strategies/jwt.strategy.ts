import 'dotenv/config';
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ✅ CORRIGIDO: Usar JWT_ACCESS_SECRET (mesmo usado ao gerar o token)
      secretOrKey: configService.get('JWT_ACCESS_SECRET') || 'your-secret-key-change-in-production',
    })
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email }
  }
}