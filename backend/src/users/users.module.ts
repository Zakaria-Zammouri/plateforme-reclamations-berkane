import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { PrismaModule } from '../prisma/prisma.module';

import { AuthModule } from '../auth/auth.module';

import { PassportModule } from '@nestjs/passport';


@Module({

  imports: [

    PrismaModule,

    AuthModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

  ],


  controllers: [
    UsersController,
  ],


  providers: [
    UsersService,
  ],


  exports: [
    UsersService,
  ],

})

export class UsersModule {}