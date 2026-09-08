import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    nom: string,
    email: string,
    password: string,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

    if (existingUser) {
      throw new ConflictException(
        'Cet email existe déjà',
      )
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const user =
      await this.prisma.user.create({
        data: {
          nom,
          email,
          password: hashedPassword,
          role: 'CITOYEN',
          actif: true,
        },
      })

    const {
      password: _,
      ...userWithoutPassword
    } = user

    return userWithoutPassword
  }

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

    if (!user) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect',
      )
    }

    if (!user.actif) {
      throw new UnauthorizedException(
        'Votre compte est désactivé. Contactez l’administrateur.',
      )
    }

    const passwordIsValid =
      await bcrypt.compare(
        password,
        user.password,
      )

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect',
      )
    }

    const {
      password: _,
      ...userWithoutPassword
    } = user

    const access_token =
      this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      })

    return {
      ...userWithoutPassword,
      access_token,
    }
  }

  async resetAdminPassword(
    email: string,
    newPassword: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

    if (!user) {
      throw new UnauthorizedException(
        'Utilisateur introuvable',
      )
    }

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'Ce compte n’est pas ADMIN',
      )
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10)

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return {
      message:
        'Mot de passe ADMIN réinitialisé avec succès',
    }
  }
}