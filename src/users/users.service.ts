import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { User } from './entities';

const logger = new Logger('User-service');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, name } = createUserDto;

    try {
      const user = this.userRepository.create({
        name,
        email,
      });

      await this.userRepository.save(user);

      return {
        ...user,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPage = await this.userRepository.count({
      where: { isActive: true },
    });
    const lastPage = Math.ceil(totalPage / limit);
    try {
      return {
        data: await this.userRepository.find({
          take: limit,
          skip: (page - 1) * limit,
          where: {
            isActive: true,
          },
        }),
        meta: {
          total: totalPage,
          page: page,
          lastPage: lastPage,
        },
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
          isActive: true,
        },
      });
      if (!user) {
        logger.warn(`User not found with id ${id}`);
        throw new NotFoundException(`User not found with id ${id}`);
      }

      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.preload({
        id,
        ...updateUserDto,
      });

      if (!user) {
        throw new NotFoundException(`User not found with id ${id}`);
      }

      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async softDeleteUser(id: string) {
    try {
      const user = await this.findOne(id);
      user.isActive = false;
      const updateUser = await this.userRepository.save(user);

      return updateUser;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    logger.error(error.message);

    throw new RpcException(error.message);
  }
}
