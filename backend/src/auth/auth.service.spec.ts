import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';

import { PrismaService } from '../prisma/prisma.service';

import { JwtService } from '@nestjs/jwt';


describe('AuthService', () => {


  let service: AuthService;



  beforeEach(async () => {


    const module: TestingModule =
      await Test.createTestingModule({

        providers: [

          AuthService,


          {
            provide: PrismaService,

            useValue: {

              user: {

                findUnique: jest.fn(),

                create: jest.fn(),

              },

            },

          },


          {
            provide: JwtService,

            useValue: {

              sign: jest.fn()
                .mockReturnValue('fake-token'),

            },

          },


        ],


      }).compile();



    service =
      module.get<AuthService>(
        AuthService,
      );


  });




  it('AuthService doit être défini', () => {


    expect(service)
      .toBeDefined();


  });



});