import { Test, TestingModule } from '@nestjs/testing';
import { FichiersService } from './fichiers.service';

describe('FichiersService', () => {
  let service: FichiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FichiersService],
    }).compile();

    service = module.get<FichiersService>(FichiersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
