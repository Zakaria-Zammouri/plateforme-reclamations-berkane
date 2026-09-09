import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

import { CreateReclamationDto } from './dto/create-reclamation.dto'
import { UpdateReclamationDto } from './dto/update-reclamation.dto'

type AnalyseIA = {
  categorie: string
  departement: string
  service: string
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'
  confiance: number
  reponse: string
}

@Injectable()
export class ReclamationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // =========================================
  // IA
  // Analyse automatique d'une réclamation
  // =========================================

  private async analyserAvecIA(
    titre: string,
    description: string,
  ): Promise<AnalyseIA | null> {
    const aiServiceUrl =
      process.env.AI_SERVICE_URL?.trim() ||
      'http://127.0.0.1:8000'

    console.log('======================================')
    console.log('🤖 APPEL MICROSERVICE IA')
    console.log('URL IA :', aiServiceUrl)
    console.log('Titre :', titre)

    try {
      const response = await fetch(
        `${aiServiceUrl}/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titre,
            description,
          }),
          signal: AbortSignal.timeout(120000),
        },
      )

      console.log(
        '📡 Réponse HTTP IA :',
        response.status,
      )

      if (!response.ok) {
        const errorText =
          await response.text()

        console.error(
          '❌ Erreur HTTP du microservice IA :',
          errorText,
        )

        console.log(
          '======================================',
        )

        return null
      }

      const rawData =
        await response.text()

      console.log(
        '📦 Réponse brute IA :',
        rawData,
      )

      let data: AnalyseIA

      try {
        data =
          JSON.parse(rawData) as AnalyseIA
      } catch {
        console.error(
          '❌ Réponse IA non JSON.',
        )

        console.log(
          '======================================',
        )

        return null
      }

      console.log(
        '✅ Analyse IA reçue :',
        data,
      )

      if (
        !data ||
        typeof data.categorie !== 'string' ||
        typeof data.departement !== 'string' ||
        typeof data.service !== 'string' ||
        typeof data.priorite !== 'string' ||
        typeof data.reponse !== 'string'
      ) {
        console.error(
          '❌ Réponse IA invalide.',
        )

        console.log(
          '======================================',
        )

        return null
      }

      const prioritesAutorisees = [
        'BASSE',
        'NORMALE',
        'HAUTE',
        'URGENTE',
      ] as const

      if (
        !prioritesAutorisees.includes(
          data.priorite,
        )
      ) {
        console.error(
          '❌ Priorité IA invalide :',
          data.priorite,
        )

        console.log(
          '======================================',
        )

        return null
      }

      const confiance =
        typeof data.confiance === 'number' &&
        Number.isFinite(data.confiance)
          ? Math.min(
              1,
              Math.max(
                0,
                data.confiance,
              ),
            )
          : 0

      const resultat: AnalyseIA = {
        categorie:
          data.categorie.trim() ||
          'AUTRE',

        departement:
          data.departement.trim() ||
          'AUTRE',

        service:
          data.service.trim() ||
          'AUTRE',

        priorite:
          data.priorite,

        confiance,

        reponse:
          data.reponse.trim() ||
          'Votre réclamation a bien été enregistrée et sera examinée par le service compétent.',
      }

      console.log(
        '✅ ANALYSE IA VALIDÉE :',
        resultat,
      )

      console.log(
        '======================================',
      )

      return resultat
    } catch (error) {
      console.error(
        '❌ IMPOSSIBLE DE CONTACTER LE MICROSERVICE IA',
      )

      console.error(error)

      console.log(
        '======================================',
      )

      return null
    }
  }

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
      .sort(
        (a, b) => b.total - a.total,
      )

    const parDepartement =
      parDepartementBrut
        .map((item) => ({
          departement:
            item.departement?.trim() ||
            'Non renseigné',

          total: item._count._all,
        }))
        .sort(
          (a, b) => b.total - a.total,
        )

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

    const parPriorite =
      prioritesAutorisees.map(
        (priorite) => ({
          priorite,
          total:
            parPrioriteMap.get(
              priorite,
            ) ?? 0,
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
      ![
        'CITOYEN',
        'AGENT',
        'ADMIN',
      ].includes(roleEffectif)
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
    // =======================================
    // Analyse automatique IA
    // =======================================

    const analyseIA =
      await this.analyserAvecIA(
        dto.titre,
        dto.description,
      )

    console.log(
      '🤖 Résultat analyse IA pour création :',
      analyseIA,
    )

    // =======================================
    // Valeurs finales
    // L'IA est prioritaire lorsqu'elle répond
    // =======================================

    const prioriteFinale =
      analyseIA?.priorite ||
      dto.priorite ||
      'NORMALE'

    const departementFinal =
      analyseIA?.departement ||
      dto.departement ||
      null

    const serviceFinal =
      analyseIA?.service ||
      dto.service ||
      null

    // =======================================
    // Numéro de classement
    // =======================================

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

    // =======================================
    // Création de la réclamation
    // =======================================

    const reclamation =
      await this.prisma.reclamation.create({
        data: {
          numeroClassement,

          titre:
            dto.titre,

          description:
            dto.description,

          priorite:
            prioriteFinale,

          // ===================================
          // Résultats IA
          // ===================================

          categorieIA:
            analyseIA?.categorie ??
            null,

          departementIA:
            analyseIA?.departement ??
            null,

          serviceIA:
            analyseIA?.service ??
            null,

          prioriteIA:
            analyseIA?.priorite ??
            null,

          confianceIA:
            analyseIA?.confiance ??
            null,

          reponseIA:
            analyseIA?.reponse ??
            null,

          analyseIAAt:
            analyseIA
              ? new Date()
              : null,

          // ===================================
          // Une réclamation avec analyse IA
          // doit être validée humainement.
          //
          // Une réclamation sans analyse IA
          // ne doit PAS être considérée
          // comme "à valider".
          // ===================================

          iaValidee:
            analyseIA
              ? false
              : true,

          // ===================================
          // Autres informations
          // ===================================

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
            departementFinal,

          service:
            serviceFinal,

          misEnCause:
            dto.misEnCause,

          userId,
        },
      })

    console.log(
      '✅ Réclamation créée :',
      {
        id: reclamation.id,

        numeroClassement:
          reclamation.numeroClassement,

        priorite:
          reclamation.priorite,

        categorieIA:
          reclamation.categorieIA,

        departementIA:
          reclamation.departementIA,

        serviceIA:
          reclamation.serviceIA,

        prioriteIA:
          reclamation.prioriteIA,

        confianceIA:
          reclamation.confianceIA,

        reponseIA:
          reclamation.reponseIA,

        analyseIAAt:
          reclamation.analyseIAAt,

        iaValidee:
          reclamation.iaValidee,
      },
    )

    // =======================================
    // Historique initial
    // =======================================

    await this.prisma.historiqueReclamation.create({
      data: {
        reclamationId:
          reclamation.id,

        userId,

        ancienStatut:
          null,

        nouveauStatut:
          reclamation.statut,

        actionTypee:
          'CREATION',

        detail:
          analyseIA
            ? 'Création de la réclamation avec analyse IA. Classification et réponse type en attente de validation humaine.'
            : 'Création de la réclamation. Aucune analyse IA disponible.',
      },
    })

    // =======================================
    // Notification citoyen
    // =======================================

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
  // VALIDATION / CORRECTION ANALYSE IA
  // ADMIN / AGENT
  // =========================================

  async validerAnalyseIA(
    id: number,
    dto: UpdateReclamationDto,
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

    // =======================================
    // Vérification de l'existence de l'analyse
    // IA
    // =======================================

    const analyseIAExiste =
      Boolean(
        reclamation.analyseIAAt ||
        reclamation.categorieIA ||
        reclamation.departementIA ||
        reclamation.serviceIA ||
        reclamation.prioriteIA ||
        reclamation.confianceIA !== null,
      )

    if (!analyseIAExiste) {
      throw new ForbiddenException(
        'Cette réclamation ne possède aucune analyse IA à valider.',
      )
    }

    // =======================================
    // Éviter une validation inutile
    // =======================================

    if (reclamation.iaValidee) {
      throw new ForbiddenException(
        'La classification IA de cette réclamation est déjà validée.',
      )
    }

    // =======================================
    // Vérification des valeurs envoyées
    // =======================================

    const prioritesAutorisees = [
      'BASSE',
      'NORMALE',
      'HAUTE',
      'URGENTE',
    ] as const

    let prioriteFinale =
      reclamation.priorite

    if (dto.priorite !== undefined) {
      const priorite =
        dto.priorite
          .trim()
          .toUpperCase()

      if (
        !prioritesAutorisees.includes(
          priorite as (typeof prioritesAutorisees)[number],
        )
      ) {
        throw new ForbiddenException(
          'Priorité invalide.',
        )
      }

      prioriteFinale =
        priorite
    }

    const departementFinal =
      dto.departement !== undefined
        ? dto.departement.trim() ||
          null
        : reclamation.departement

    const serviceFinal =
      dto.service !== undefined
        ? dto.service.trim() ||
          null
        : reclamation.service

    // =======================================
    // Les valeurs finales doivent être
    // renseignées pour valider la classification
    // =======================================

    if (!departementFinal) {
      throw new ForbiddenException(
        'Le département final est obligatoire pour valider la classification IA.',
      )
    }

    if (!serviceFinal) {
      throw new ForbiddenException(
        'Le service final est obligatoire pour valider la classification IA.',
      )
    }

    // =======================================
    // Mise à jour des valeurs finales
    // + classification IA validée
    // =======================================

    const updatedReclamation =
      await this.prisma.reclamation.update({
        where: {
          id,
        },

        data: {
          departement:
            departementFinal,

          service:
            serviceFinal,

          priorite:
            prioriteFinale,

          iaValidee:
            true,
        },
      })

    // =======================================
    // Historique de validation/correction IA
    // =======================================

    const detailValidationIA =
      [
        'Classification IA validée.',
        `Département final : ${
          updatedReclamation.departement ||
          'Non renseigné'
        }.`,
        `Service final : ${
          updatedReclamation.service ||
          'Non renseigné'
        }.`,
        `Priorité finale : ${
          updatedReclamation.priorite ||
          'Non renseignée'
        }.`,
        `Proposition IA - catégorie : ${
          reclamation.categorieIA ||
          'Non renseignée'
        }.`,
        `Proposition IA - département : ${
          reclamation.departementIA ||
          'Non renseigné'
        }.`,
        `Proposition IA - service : ${
          reclamation.serviceIA ||
          'Non renseigné'
        }.`,
        `Proposition IA - priorité : ${
          reclamation.prioriteIA ||
          'Non renseignée'
        }.`,
        `Confiance IA : ${
          reclamation.confianceIA !== null
            ? `${Math.round(
                reclamation.confianceIA *
                  100,
              )}%`
            : 'Non renseignée'
        }.`,
        `Réponse type IA : ${
          reclamation.reponseIA ||
          'Non disponible'
        }.`,
      ].join(' ')

    await this.prisma.historiqueReclamation.create({
      data: {
        reclamationId:
          id,

        userId,

        ancienStatut:
          reclamation.statut,

        nouveauStatut:
          updatedReclamation.statut,

        actionTypee:
          'VALIDATION_IA',

        detail:
          detailValidationIA,
      },
    })

    // =======================================
    // Log de validation/correction
    // =======================================

    console.log(
      '🧑‍💼 VALIDATION ANALYSE IA',
    )

    console.log({
      reclamationId:
        id,

      userId,

      ancienneValeur: {
        departement:
          reclamation.departement,

        service:
          reclamation.service,

        priorite:
          reclamation.priorite,

        iaValidee:
          reclamation.iaValidee,
      },

      nouvelleValeur: {
        departement:
          updatedReclamation.departement,

        service:
          updatedReclamation.service,

        priorite:
          updatedReclamation.priorite,

        iaValidee:
          updatedReclamation.iaValidee,
      },

      propositionIA: {
        categorie:
          reclamation.categorieIA,

        departement:
          reclamation.departementIA,

        service:
          reclamation.serviceIA,

        priorite:
          reclamation.prioriteIA,

        confiance:
          reclamation.confianceIA,

        reponse:
          reclamation.reponseIA,

        analyseAt:
          reclamation.analyseIAAt,
      },
    })

    // =======================================
    // Notification citoyen
    // =======================================

    if (reclamation.userId) {
      await this.notificationsService.create(
        reclamation.userId,

        'Analyse de votre réclamation',

        `La classification de votre réclamation n°${reclamation.numeroClassement} a été vérifiée par un agent de la commune.`,

        'INFO',

        reclamation.id,
      )
    }

    return updatedReclamation
  }

  // =========================================
  // REPONSE FINALE AU CITOYEN
  // ADMIN / AGENT
  // =========================================

  async envoyerReponse(
    id: number,
    reponse: string,
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

    // =======================================
    // Vérification du citoyen destinataire
    // =======================================

    if (!reclamation.userId) {
      throw new BadRequestException(
        'Cette réclamation n’est associée à aucun citoyen.',
      )
    }

    // =======================================
    // Vérification de la réponse
    // =======================================

    const reponseNettoyee =
      typeof reponse === 'string'
        ? reponse.trim()
        : ''

    if (!reponseNettoyee) {
      throw new BadRequestException(
        'La réponse ne peut pas être vide.',
      )
    }

    // =======================================
    // Empêcher un second envoi accidentel
    // =======================================

    if (reclamation.reponseFinale) {
      throw new BadRequestException(
        'Une réponse finale a déjà été envoyée pour cette réclamation.',
      )
    }

    // =======================================
    // Enregistrement + historique
    // + notification citoyen
    // =======================================

    const resultat =
      await this.prisma.$transaction(
        async (tx) => {
          const reclamationMiseAJour =
            await tx.reclamation.update({
              where: {
                id,
              },

              data: {
                reponseFinale:
                  reponseNettoyee,
              },
            })

          await tx.historiqueReclamation.create({
            data: {
              reclamationId:
                id,

              userId,

              ancienStatut:
                reclamation.statut,

              nouveauStatut:
                reclamation.statut,

              actionTypee:
                'REPONSE_CITOYEN',

              detail:
                'Réponse finale préparée par un agent et envoyée au citoyen.',
            },
          })

          await tx.notification.create({
            data: {
              userId:
                reclamation.userId!,

              reclamationId:
                id,

              titre:
                'Réponse à votre réclamation',

              message:
                reponseNettoyee,

              type:
                'REPONSE',
            },
          })

          return reclamationMiseAJour
        },
      )

    console.log(
      '✅ RÉPONSE FINALE ENVOYÉE AU CITOYEN',
    )

    console.log({
      reclamationId:
        id,

      numeroClassement:
        reclamation.numeroClassement,

      userId,

      citoyenId:
        reclamation.userId,

      reponse:
        reponseNettoyee,
    })

    return {
      message:
        'La réponse finale a été envoyée au citoyen.',
      reclamation:
        resultat,
    }
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

    // =======================================
    // Historique du changement de statut
    // =======================================

    await this.prisma.historiqueReclamation.create({
      data: {
        reclamationId:
          id,

        userId,

        ancienStatut:
          reclamation.statut,

        nouveauStatut,

        actionTypee:
          'STATUT',

        detail:
          `Changement de statut : ${reclamation.statut} → ${nouveauStatut}.`,
      },
    })

    // =======================================
    // Notification citoyen
    // =======================================

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