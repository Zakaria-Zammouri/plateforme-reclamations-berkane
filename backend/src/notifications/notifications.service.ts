import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================================
  // CRÉER UNE NOTIFICATION
  // =========================================

  async create(
    userId: number,
    titre: string,
    message: string,
    type = 'INFO',
    reclamationId?: number,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        titre,
        message,
        type,
        reclamationId:
          reclamationId ?? null,
      },
    })
  }

  // =========================================
  // MES NOTIFICATIONS
  // =========================================

  async getMyNotifications(
    userId: number,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },

      include: {
        reclamation: {
          select: {
            id: true,
            numeroClassement: true,
            titre: true,
            statut: true,
          },
        },
      },

      orderBy: [
        {
          lu: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    })
  }

  // =========================================
  // MES NOTIFICATIONS NON LUES
  // =========================================

  async getUnreadNotifications(
    userId: number,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        lu: false,
      },

      include: {
        reclamation: {
          select: {
            id: true,
            numeroClassement: true,
            titre: true,
            statut: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // =========================================
  // NOMBRE DE NOTIFICATIONS NON LUES
  // =========================================

  async getUnreadCount(
    userId: number,
  ) {
    const count =
      await this.prisma.notification.count({
        where: {
          userId,
          lu: false,
        },
      })

    return {
      count,
    }
  }

  // =========================================
  // MARQUER UNE NOTIFICATION COMME LUE
  // =========================================

  async markAsRead(
    id: number,
    userId: number,
  ) {
    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id,
        },
      })

    if (!notification) {
      throw new NotFoundException(
        'Notification introuvable.',
      )
    }

    if (
      notification.userId !== userId
    ) {
      throw new ForbiddenException(
        'Accès refusé à cette notification.',
      )
    }

    return this.prisma.notification.update({
      where: {
        id,
      },

      data: {
        lu: true,
      },
    })
  }

  // =========================================
  // MARQUER TOUTES LES NOTIFICATIONS COMME LUES
  // =========================================

  async markAllAsRead(
    userId: number,
  ) {
    const result =
      await this.prisma.notification.updateMany({
        where: {
          userId,
          lu: false,
        },

        data: {
          lu: true,
        },
      })

    return {
      message:
        'Toutes les notifications ont été marquées comme lues.',
      count: result.count,
    }
  }
}