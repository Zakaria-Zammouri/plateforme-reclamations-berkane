import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

const ROLES_AUTORISES = [
  'CITOYEN',
  'AGENT',
  'ADMIN',
] as const

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // Tous les utilisateurs
  async getAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // Un utilisateur
  async getOne(id: number) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          nom: true,
          email: true,
          role: true,
          actif: true,
          createdAt: true,
          updatedAt: true,
        },
      })

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      )
    }

    return user
  }

  // Modifier utilisateur
  async update(
    id: number,
    data: {
      nom?: string
      role?: string
      actif?: boolean
    },
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      })

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      )
    }

    if (
      data.role !== undefined &&
      !ROLES_AUTORISES.includes(
        data.role as (typeof ROLES_AUTORISES)[number],
      )
    ) {
      throw new BadRequestException(
        'Rôle invalide. Les rôles autorisés sont : CITOYEN, AGENT et ADMIN.',
      )
    }

    if (
      data.actif !== undefined &&
      typeof data.actif !== 'boolean'
    ) {
      throw new BadRequestException(
        'La valeur actif doit être un booléen.',
      )
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        ...(data.nom !== undefined && {
          nom: data.nom,
        }),

        ...(data.role !== undefined && {
          role: data.role,
        }),

        ...(data.actif !== undefined && {
          actif: data.actif,
        }),
      },

      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
      },
    })
  }

  // Supprimer utilisateur
  async delete(id: number) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      })

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      )
    }

    const historiqueCount =
      await this.prisma.historiqueReclamation.count({
        where: {
          userId: id,
        },
      })

    if (historiqueCount > 0) {
      throw new BadRequestException(
        'Impossible de supprimer cet utilisateur car il est référencé dans l’historique des réclamations. Désactivez plutôt son compte.',
      )
    }

    return this.prisma.user.delete({
      where: {
        id,
      },
    })
  }
}