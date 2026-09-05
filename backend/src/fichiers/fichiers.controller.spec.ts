import { Test, TestingModule } from '@nestjs/testing';
import { FichiersController } from './fichiers.controller';

describe('FichiersController', () => {
  let controller: FichiersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichiersController],
    }).compile();

    controller = module.get<FichiersController>(FichiersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
