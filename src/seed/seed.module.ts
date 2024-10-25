import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { UserSeedService } from './seed.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [SeedController],
  providers: [UserSeedService],
  imports: [UsersModule]
})
export class SeedModule {}
