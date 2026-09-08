import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

import { CreateReclamationDto } from './dto/create-reclamation.dto'
import { UpdateReclamationDto } from './dto/update-reclamation.dto'

@Injectable()
export class ReclamationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // =========================================
  // ADMIN / AGENT
  // Toutes les réclamations
  // =========================================

  async getAll() {
    return this.prisma.reclamation.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            email: true,
            role: true,
          },
        },

        fichiers: true,

        historiques: {
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                email: true,
                role: true,
              },
            },
          },

          orderBy: {
            createdAt: 'asc',
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // =========================================
  // STATISTIQUES
  // ADMIN / AGENT
  // =========================================

  async getStatistiques() {
    const [
      total,
      enAttente,
      enCours,
      traitees,
      rejetees,
      parServiceBrut,
      parDepartementBrut,
      parPrioriteBrut,
    ] = await Promise.all([
      this.prisma.reclamation.count(),

      this.prisma.reclamation.count({
        where: {
          statut: 'EN_ATTENTE',
        },
      }),

      this.prisma.reclamation.count({
        where: {
          statut: 'EN_COURS',
        },
      }),

      this.prisma.reclamation.count({
        where: {
          statut: 'TRAITEE',
        },
      }),

      this.prisma.reclamation.count({
        where: {
          statut: 'REJETEE',
        },
      }),

      this.prisma.reclamation.groupBy({
        by: ['service'],

        _count: {
          _all: true,
        },
      }),

      this.prisma.reclamation.groupBy({
        by: ['departement'],

        _count: {
          _all: true,
        },
      }),

      this.prisma.reclamation.groupBy({
        by: ['priorite'],

        _count: {
          _all: true,
        },
      }),
    ])

    const parService = parServiceBrut
      .map((item) => ({
        service:
          item.service?.trim() ||
          'Non renseigné',

        total: item._count._all,
      }))
      .sort((a, b) => b.total - a.total)

    const parDepartement = parDepartementBrut
      .map((item) => ({
        departement:
          item.departement?.trim() ||
          'Non renseigné',

        total: item._count._all,
      }))
      .sort((a, b) => b.total - a.total)

    const prioritesAutorisees = [
      'BASSE',
      'NORMALE',
      'HAUTE',
      'URGENTE',
    ]

    const parPrioriteMap = new Map(
      parPrioriteBrut.map((item) => [
        item.priorite,
        item._count._all,
      ]),
    )

    const parPriorite = prioritesAutorisees.map(
      (priorite) => ({
        priorite,
        total:
          parPrioriteMap.get(priorite) ?? 0,
      }),
    )

    return {
      total,
      enAttente,
      enCours,
      traitees,
      rejetees,
      parService,
      parDepartement,
      parPriorite,
    }
  }

  // =========================================
  // DETAIL D'UNE RECLAMATION
  // CITOYEN = uniquement ses réclamations
  // AGENT / ADMIN = accès autorisé
  // =========================================

  async getOne(
    id: number,
    userId: number,
    role: string,
  ) {
    const reclamation =
      await this.prisma.reclamation.findUnique({
        where: {
          id,
        },

        include: {
          user: {
            select: {
              id: true,
              nom: true,
              email: true,
              role: true,
            },
          },

          fichiers: true,

          historiques: {
            include: {
              user: {
                select: {
                  id: true,
                  nom: true,
                  email: true,
                  role: true,
                },
              },
            },

            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

    if (!reclamation) {
      throw new NotFoundException(
        'Réclamation introuvable.',
      )
    }

    const roleEffectif =
      typeof role === 'string'
        ? role.trim().toUpperCase()
        : ''

    if (
      roleEffectif === 'CITOYEN' &&
      reclamation.userId !== userId
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez consulter que vos propres réclamations.',
      )
    }

    if (
      !['CITOYEN', 'AGENT', 'ADMIN'].includes(
        roleEffectif,
      )
    ) {
      throw new ForbiddenException(
        'Accès refusé.',
      )
    }

    return reclamation
  }

  // =========================================
  // CITOYEN
  // Mes réclamations
  // =========================================

  async getMyReclamations(
    userId: number,
  ) {
    return this.prisma.reclamation.findMany({
      where: {
        userId,
      },

      include: {
        fichiers: true,

        historiques: {
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                email: true,
                role: true,
              },
            },
          },

          orderBy: {
            createdAt: 'asc',
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // =========================================
  // CREATION
  // =========================================

  async create(
    dto: CreateReclamationDto,
    userId: number,
  ) {
    const last =
      await this.prisma.reclamation.findFirst({
        orderBy: {
          numeroClassement: 'desc',
        },
      })

    const numeroClassement =
      last
        ? last.numeroClassement + 1
        : 1

    const reclamation =
      await this.prisma.reclamation.create({
        data: {
          numeroClassement,

          titre:
            dto.titre,

          description:
            dto.description,

          priorite:
            dto.priorite || 'NORMALE',

          numeroBureauOrdre:
            dto.numeroBureauOrdre,

          dateBureauOrdre:
            dto.dateBureauOrdre
              ? new Date(
                  dto.dateBureauOrdre,
                )
              : null,

          dateReception:
            dto.dateReception
              ? new Date(
                  dto.dateReception,
                )
              : null,

          departement:
            dto.departement,

          service:
            dto.service,

          misEnCause:
            dto.misEnCause,

          userId,
        },
      })

    // Première entrée dans l'historique
    await this.prisma.historiqueReclamation.create({
      data: {
        reclamationId:
          reclamation.id,

        userId,

        ancienStatut:
          null,

        nouveauStatut:
          reclamation.statut,
      },
    })

    // Notification au citoyen
    await this.notificationsService.create(
      userId,

      'Réclamation enregistrée',

      `Votre réclamation n°${reclamation.numeroClassement} a bien été enregistrée. Elle est actuellement en attente de traitement.`,

      'RECLAMATION',

      reclamation.id,
    )

    return reclamation
  }

  // =========================================
  // MODIFICATION ADMIN
  // =========================================

  async update(
    id: number,
    dto: UpdateReclamationDto,
  ) {
    const reclamation =
      await this.prisma.reclamation.findUnique({
        where: {
          id,
        },
      })

    if (!reclamation) {
      throw new NotFoundException(
        'Réclamation introuvable.',
      )
    }

    return this.prisma.reclamation.update({
      where: {
        id,
      },

      data: {
        ...dto,

        dateBureauOrdre:
          dto.dateBureauOrdre
            ? new Date(
                dto.dateBureauOrdre,
              )
            : undefined,

        dateReception:
          dto.dateReception
            ? new Date(
                dto.dateReception,
              )
            : undefined,
      },
    })
  }

  // =========================================
  // CHANGEMENT DE STATUT
  // =========================================

  async updateStatut(
    id: number,
    statut: string,
    userId: number,
  ) {
    const reclamation =
      await this.prisma.reclamation.findUnique({
        where: {
          id,
        },
      })

    if (!reclamation) {
      throw new NotFoundException(
        'Réclamation introuvable.',
      )
    }

    const nouveauStatut =
      typeof statut === 'string'
        ? statut.trim().toUpperCase()
        : ''

    const statutsAutorises = [
      'EN_ATTENTE',
      'EN_COURS',
      'TRAITEE',
      'REJETEE',
    ]

    if (
      !statutsAutorises.includes(
        nouveauStatut,
      )
    ) {
      throw new ForbiddenException(
        'Statut de réclamation invalide.',
      )
    }

    if (
      reclamation.statut ===
      nouveauStatut
    ) {
      return reclamation
    }

    const updatedReclamation =
      await this.prisma.reclamation.update({
        where: {
          id,
        },

        data: {
          statut:
            nouveauStatut,
        },
      })

    // Enregistrer le changement
    await this.prisma.historiqueReclamation.create({
      data: {
        reclamationId:
          id,

        userId,

        ancienStatut:
          reclamation.statut,

        nouveauStatut,
      },
    })

    // Notification au citoyen propriétaire
    if (reclamation.userId) {
      let titreNotification =
        'Mise à jour de votre réclamation'

      let messageNotification =
        `Le statut de votre réclamation n°${reclamation.numeroClassement} a été modifié.`

      switch (nouveauStatut) {
        case 'EN_ATTENTE':
          titreNotification =
            'Réclamation en attente'

          messageNotification =
            `Votre réclamation n°${reclamation.numeroClassement} est actuellement en attente de traitement.`

          break

        case 'EN_COURS':
          titreNotification =
            'Réclamation en cours de traitement'

          messageNotification =
            `Votre réclamation n°${reclamation.numeroClassement} est maintenant en cours de traitement.`

          break

        case 'TRAITEE':
          titreNotification =
            'Réclamation traitée'

          messageNotification =
            `Votre réclamation n°${reclamation.numeroClassement} a été traitée.`

          break

        case 'REJETEE':
          titreNotification =
            'Réclamation rejetée'

          messageNotification =
            `Votre réclamation n°${reclamation.numeroClassement} a été rejetée. Consultez son détail pour plus d'informations.`

          break
      }

      await this.notificationsService.create(
        reclamation.userId,

        titreNotification,

        messageNotification,

        'STATUT',

        reclamation.id,
      )
    }

    return updatedReclamation
  }

  // =========================================
  // SUPPRESSION ADMIN
  // =========================================

  async delete(
    id: number,
  ) {
    const reclamation =
      await this.prisma.reclamation.findUnique({
        where: {
          id,
        },
      })

    if (!reclamation) {
      throw new NotFoundException(
        'Réclamation introuvable.',
      )
    }

    return this.prisma.reclamation.delete({
      where: {
        id,
      },
    })
  }
}