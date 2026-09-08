import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { PassportStrategy } from '@nestjs/passport'
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt'

import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret =
      process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET est obligatoire dans le fichier .env',
      )
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: jwtSecret,
    })
  }

  async validate(payload: any) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },

        select: {
          id: true,
          email: true,
          role: true,
          actif: true,
        },
      })

    if (!user) {
      throw new UnauthorizedException(
        'Utilisateur introuvable.',
      )
    }

    if (!user.actif) {
      throw new UnauthorizedException(
        'Votre compte est désactivé. Contactez l’administrateur.',
      )
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    }
  }
}