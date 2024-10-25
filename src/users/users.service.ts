import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
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
      logger.error(error.message);
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
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
    const user = await this.userRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!user) {
      logger.error(`User not found with id ${id}`);
      throw new RpcException({
        message: `User not found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      logger.error(`User not found with id ${id}`);
      throw new RpcException({
        message: `User not found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        logger.error(error.detail);
        throw new RpcException({
          message: error.detail,
          status: HttpStatus.BAD_REQUEST,
        });
      }
    }
    return user;
  } 

  async softDeleteUser(id: string) {
    const user = await this.findOne(id);

    if (!user) {
      logger.error(`User not found with id ${id}`);
      throw new RpcException({
        message: `User not found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    user.isActive = false;
    const deleteTask = await this.userRepository.save(user);

    return deleteTask;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      logger.error(`Conflict error: ${error.message}`);
      throw new ConflictException('Conflict e');
    }

    if (error instanceof NotFoundException) {
      logger.error(`Resource not found: ${error.message}`);
      throw new NotFoundException('Not found');
    }

    logger.error(`Database error: ${error.message}`);
    throw new InternalServerErrorException('Internal server error');
  }
}
