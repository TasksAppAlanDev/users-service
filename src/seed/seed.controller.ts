import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserSeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: UserSeedService) {}

  @MessagePattern('seedUsers')
  async seedTasks() {
    return this.seedService.seed();
  }
}
