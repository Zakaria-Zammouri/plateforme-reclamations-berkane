import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

import { existsSync } from 'fs'
import {
  readFile,
  unlink,
} from 'fs/promises'

import {
  basename,
  join,
  resolve,
} from 'path'

@Injectable()
export class FichiersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async verifierAccesReclamation(
    reclamationId: number,
    userId: number,
    role: string,
  ) {
    const reclamation =
      await this.prisma.reclamation.findUnique({
        where: {
          id: reclamationId,
        },

        select: {
          id: true,
          userId: true,
        },
      })

    if (!reclamation) {
      throw new NotFoundException(
        'Réclamation introuvable',
      )
    }

    const utilisateur =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          role: true,
          actif: true,
        },
      })

    if (!utilisateur) {
      throw new ForbiddenException(
        'Utilisateur introuvable.',
      )
    }

    if (!utilisateur.actif) {
      throw new ForbiddenException(
        'Compte utilisateur désactivé.',
      )
    }

    const roleJwt =
      typeof role === 'string'
        ? role.trim().toUpperCase()
        : ''

    const roleBase =
      typeof utilisateur.role === 'string'
        ? utilisateur.role
            .trim()
            .toUpperCase()
        : ''

    const roleEffectif =
      roleBase || roleJwt

    if (
      roleEffectif === 'ADMIN' ||
      roleEffectif === 'AGENT'
    ) {
      return reclamation
    }

    if (
      roleEffectif === 'CITOYEN'
    ) {
      if (
        reclamation.userId !==
        userId
      ) {
        throw new ForbiddenException(
          'Accès refusé à cette réclamation.',
        )
      }

      return reclamation
    }

    throw new ForbiddenException(
      'Accès refusé.',
    )
  }

  private async verifierContenuFichier(
    chemin: string,
    typeMime: string | undefined,
  ) {
    const contenu =
      await readFile(chemin)

    if (
      typeMime ===
      'application/pdf'
    ) {
      const signature =
        contenu
          .subarray(0, 4)
          .toString('ascii')

      if (
        signature !== '%PDF'
      ) {
        throw new BadRequestException(
          'Le contenu du fichier ne correspond pas à un PDF valide.',
        )
      }

      return
    }

    if (
      typeMime ===
      'image/png'
    ) {
      const signature =
        contenu
          .subarray(0, 8)
          .toString('hex')

      if (
        signature !==
        '89504e470d0a1a0a'
      ) {
        throw new BadRequestException(
          'Le contenu du fichier ne correspond pas à une image PNG valide.',
        )
      }

      return
    }

    if (
      typeMime ===
      'image/jpeg'
    ) {
      const debut =
        contenu.subarray(0, 3)

      const fin =
        contenu.subarray(
          Math.max(
            0,
            contenu.length - 2,
          ),
        )

      const signatureValide =
        debut[0] === 0xff &&
        debut[1] === 0xd8 &&
        debut[2] === 0xff &&
        fin[0] === 0xff &&
        fin[1] === 0xd9

      if (!signatureValide) {
        throw new BadRequestException(
          'Le contenu du fichier ne correspond pas à une image JPEG valide.',
        )
      }

      return
    }

    throw new BadRequestException(
      'Type de fichier non autorisé.',
    )
  }

  private getCheminFichierSecurise(
    chemin: string,
  ) {
    const uploadsRoot =
      resolve(
        process.cwd(),
        'uploads',
      )

    const cheminNormalise =
      chemin.replace(
        /\\/g,
        '/',
      )

    const cheminFichier =
      resolve(
        process.cwd(),
        cheminNormalise,
      )

    const uploadsRootNormalise =
      uploadsRoot.replace(
        /\\/g,
        '/',
      )

    const cheminFichierNormalise =
      cheminFichier.replace(
        /\\/g,
        '/',
      )

    if (
      cheminFichierNormalise !==
        uploadsRootNormalise &&
      !cheminFichierNormalise.startsWith(
        uploadsRootNormalise + '/',
      )
    ) {
      throw new ForbiddenException(
        'Chemin de fichier non autorisé.',
      )
    }

    return cheminFichier
  }

  async getByReclamation(
    reclamationId: number,
    userId: number,
    role: string,
  ) {
    await this.verifierAccesReclamation(
      reclamationId,
      userId,
      role,
    )

    const fichiers =
      await this.prisma.fichierJoint.findMany({
        where: {
          reclamationId,
        },

        orderBy: {
          createdAt: 'desc',
        },
      })

    return fichiers.map(
      (fichier) => ({
        ...fichier,

        url:
          `http://localhost:3000/reclamations/${reclamationId}/fichiers/${fichier.id}/telecharger`,
      }),
    )
  }

  async create(
    reclamationId: number,
    userId: number,
    role: string,
    data: {
      nomFichier: string
      chemin: string
      typeMime?: string
      taille?: number
    },
  ) {
    try {
      await this.verifierAccesReclamation(
        reclamationId,
        userId,
        role,
      )

      if (!data.chemin) {
        throw new BadRequestException(
          'Fichier invalide.',
        )
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
      ]

      if (
        !data.typeMime ||
        !allowedTypes.includes(
          data.typeMime,
        )
      ) {
        throw new BadRequestException(
          'Type de fichier non autorisé.',
        )
      }

      if (
        data.taille ===
          undefined ||
        data.taille <= 0
      ) {
        throw new BadRequestException(
          'Le fichier est vide ou invalide.',
        )
      }

      if (
        data.taille >
        5 * 1024 * 1024
      ) {
        throw new BadRequestException(
          'Le fichier dépasse la taille maximale de 5 Mo.',
        )
      }

      const cheminNormalise =
        data.chemin.replace(
          /\\/g,
          '/',
        )

      const cheminSecurise =
        this.getCheminFichierSecurise(
          cheminNormalise,
        )

      if (
        !existsSync(
          cheminSecurise,
        )
      ) {
        throw new BadRequestException(
          'Le fichier est introuvable sur le serveur.',
        )
      }

      await this.verifierContenuFichier(
        cheminSecurise,
        data.typeMime,
      )

      const fichier =
        await this.prisma.fichierJoint.create({
          data: {
            reclamationId,

            nomFichier:
              data.nomFichier,

            chemin:
              cheminNormalise,

            typeMime:
              data.typeMime,

            taille:
              data.taille,
          },
        })

      return {
        ...fichier,

        url:
          `http://localhost:3000/reclamations/${reclamationId}/fichiers/${fichier.id}/telecharger`,
      }
    } catch (error) {
      const cheminNormalise =
        data.chemin
          ? data.chemin.replace(
              /\\/g,
              '/',
            )
          : ''

      if (cheminNormalise) {
        try {
          const cheminSecurise =
            this.getCheminFichierSecurise(
              cheminNormalise,
            )

          if (
            existsSync(
              cheminSecurise,
            )
          ) {
            await unlink(
              cheminSecurise,
            ).catch(() => {})
          }
        } catch {
          // Ne pas masquer l'erreur originale.
        }
      }

      throw error
    }
  }

  async download(
    id: number,
    reclamationId: number,
    userId: number,
    role: string,
  ) {
    await this.verifierAccesReclamation(
      reclamationId,
      userId,
      role,
    )

    const fichier =
      await this.prisma.fichierJoint.findFirst({
        where: {
          id,
          reclamationId,
        },
      })

    if (!fichier) {
      throw new NotFoundException(
        'Fichier introuvable',
      )
    }

    const cheminSecurise =
      this.getCheminFichierSecurise(
        fichier.chemin,
      )

    if (
      !existsSync(
        cheminSecurise,
      )
    ) {
      throw new NotFoundException(
        'Fichier physique introuvable.',
      )
    }

    const contenu =
      await readFile(
        cheminSecurise,
      )

    return {
      contenu,
      nomFichier:
        basename(
          fichier.nomFichier,
        ),
      typeMime:
        fichier.typeMime ||
        'application/octet-stream',
    }
  }

  async delete(
    id: number,
    reclamationId: number,
    userId: number,
    role: string,
  ) {
    await this.verifierAccesReclamation(
      reclamationId,
      userId,
      role,
    )

    const fichier =
      await this.prisma.fichierJoint.findFirst({
        where: {
          id,
          reclamationId,
        },
      })

    if (!fichier) {
      throw new NotFoundException(
        'Fichier introuvable',
      )
    }

    const cheminSecurise =
      this.getCheminFichierSecurise(
        fichier.chemin,
      )

    if (
      existsSync(
        cheminSecurise,
      )
    ) {
      await unlink(
        cheminSecurise,
      )
    }

    return this.prisma.fichierJoint.delete({
      where: {
        id,
      },
    })
  }
}