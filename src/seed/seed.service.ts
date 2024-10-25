import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities';
import { Repository } from 'typeorm';
import { userSeedData } from './data/seed.data';

const logger = new Logger('UserSeedService');

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.userRepository.clear();

    const saveUsersPromises = userSeedData.map(async (userData) => {
      const user = this.userRepository.create({
        ...userData,
        isActive: true,
      });
      return this.userRepository.save(user);
    });

    try {
      const savedUsers = await Promise.all(saveUsersPromises);
      return { message: 'Users seeded successfully', count: savedUsers.length };
    } catch (error) {
      logger.error('Error seeding users: ', error.message);
      throw new InternalServerErrorException('Failed to seed users');
    }
  }
}
