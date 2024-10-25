import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';

@Module({
  controllers: [UsersController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User])
  ],
  providers: [UsersService],
  exports: [TypeOrmModule]
})
export class UsersModule {} 
