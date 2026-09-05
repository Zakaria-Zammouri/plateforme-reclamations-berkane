import { Test, TestingModule } from '@nestjs/testing';

import { ReclamationsService } from './reclamations.service';

import { PrismaService } from '../prisma/prisma.service';



describe('ReclamationsService', () => {


  let service: ReclamationsService;



  beforeEach(async()=>{


    const module: TestingModule =
      await Test.createTestingModule({

        providers:[


          ReclamationsService,


          {

            provide: PrismaService,

            useValue:{


              reclamation:{


                findMany:jest.fn(),

                findUnique:jest.fn(),

                create:jest.fn(),

                update:jest.fn(),

                delete:jest.fn(),


              },


            },


          },


        ],


      }).compile();



    service =
      module.get<ReclamationsService>(
        ReclamationsService,
      );


  });




  it('ReclamationsService doit être défini',()=>{


    expect(service)
      .toBeDefined();


  });



});