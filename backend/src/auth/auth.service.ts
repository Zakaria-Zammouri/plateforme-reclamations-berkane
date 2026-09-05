import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


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
    role?: string,
  ) {


    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });


    if (existingUser) {
      throw new ConflictException(
        'Cet email existe déjà',
      );
    }


    // Cryptage du mot de passe
    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );


    // Création utilisateur
    const user = await this.prisma.user.create({
      data: {
        nom,
        email,
        password: hashedPassword,
        role: role ?? 'CITOYEN',
      },
    });


    // Ne pas retourner le password
    const {
      password: _,
      ...userWithoutPassword
    } = user;


    return userWithoutPassword;
  }



  async login(
    email: string,
    password: string,
  ) {


    // Recherche utilisateur
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });



    if (!user) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect',
      );
    }



    // Vérification mot de passe
    const passwordIsValid =
      await bcrypt.compare(
        password,
        user.password,
      );



    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect',
      );
    }



    // Supprimer password
    const {
      password: _,
      ...userWithoutPassword
    } = user;



    // Générer JWT
    const access_token =
      this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });



    return {
      ...userWithoutPassword,
      access_token,
    };
  }

}