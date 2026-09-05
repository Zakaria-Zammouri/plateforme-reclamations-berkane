import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { FichiersController } from './fichiers.controller';
import { FichiersService } from './fichiers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [FichiersController],
  providers: [FichiersService],
})
export class FichiersModule {}