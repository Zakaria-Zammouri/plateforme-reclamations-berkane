import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ReclamationsController } from './reclamations.controller';
import { ReclamationsService } from './reclamations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [ReclamationsController],
  providers: [ReclamationsService],
})
export class ReclamationsModule {}