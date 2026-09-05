import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';


@Injectable()
export class FichiersService {


  constructor(
    private readonly prisma: PrismaService,
  ) {}



  // ============================
  // Liste des fichiers d'une réclamation
  // ============================

  async getByReclamation(
    reclamationId: number,
  ) {


    const fichiers =
      await this.prisma.fichierJoint.findMany({

        where: {
          reclamationId,
        },

        orderBy: {
          createdAt: 'desc',
        },

      });



    return fichiers.map((fichier: any) => ({

      ...fichier,

      url:
        `http://localhost:3000/${fichier.chemin}`,

    }));

  }







  // ============================
  // Ajouter un fichier
  // ============================

  async create(

    reclamationId: number,

    data: {

      nomFichier: string;

      chemin: string;

      typeMime?: string;

      taille?: number;

    },

  ) {



    const reclamation =
      await this.prisma.reclamation.findUnique({

        where: {
          id: reclamationId,
        },

      });



    if (!reclamation) {

      throw new NotFoundException(
        'Réclamation introuvable',
      );

    }





    const fichier =
      await this.prisma.fichierJoint.create({

        data: {

          reclamationId,


          nomFichier:
            data.nomFichier,


          chemin:
            data.chemin.replace(/\\/g, '/'),


          typeMime:
            data.typeMime,


          taille:
            data.taille,

        },

      });





    return {

      ...fichier,


      url:
        `http://localhost:3000/${fichier.chemin}`,

    };


  }










  // ============================
  // Supprimer un fichier
  // ============================

  async delete(

    id: number,

    reclamationId: number,

  ) {



    const fichier =
      await this.prisma.fichierJoint.findFirst({

        where: {

          id,

          reclamationId,

        },

      });





    if (!fichier) {

      throw new NotFoundException(
        'Fichier introuvable',
      );

    }





    const cheminComplet =
      join(

        process.cwd(),

        fichier.chemin,

      );






    if (existsSync(cheminComplet)) {


      await unlink(
        cheminComplet,
      );


    }







    return this.prisma.fichierJoint.delete({

      where: {

        id,

      },

    });


  }



}