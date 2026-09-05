import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

import helmet from 'helmet';

import { AppModule } from './app.module';



async function bootstrap() {


  const app = await NestFactory.create(
    AppModule,
  );



  // ============================
  // Sécurité HTTP
  // ============================

  app.use(
    helmet(),
  );



  // ============================
  // CORS
  // ============================

  app.enableCors({

    origin: [

      'http://localhost:4200',

      'http://localhost:3001',

    ],

    credentials:true,

  });





  // ============================
  // Validation globale DTO
  // ============================

  app.useGlobalPipes(

    new ValidationPipe({

      whitelist:true,

      forbidNonWhitelisted:true,

      transform:true,

    }),

  );






  // ============================
  // Swagger + JWT
  // ============================


  const config =
    new DocumentBuilder()

      .setTitle(
        'Plateforme Réclamations Berkane',
      )


      .setDescription(
        'API gestion des réclamations citoyennes',
      )


      .setVersion(
        '1.0',
      )


      .addBearerAuth(

        {

          type:'http',

          scheme:'bearer',

          bearerFormat:'JWT',

        },

        'access-token',

      )


      .build();





  const document =
    SwaggerModule.createDocument(

      app,

      config,

    );





  SwaggerModule.setup(

    'api',

    app,

    document,

    {

      swaggerOptions: {

        persistAuthorization:true,

      },

    },

  );






  // ============================
  // Démarrage serveur
  // ============================


  await app.listen(
    3000,
  );



  console.log(
    '================================='
  );

  console.log(
    'API démarrée : http://localhost:3000'
  );

  console.log(
    'Swagger : http://localhost:3000/api'
  );

  console.log(
    '================================='
  );


}



bootstrap();