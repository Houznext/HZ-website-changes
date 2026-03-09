import { Repository, Between } from 'typeorm';
import { CBQuery } from './entities/query.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateQueryDto,
  QueryResponseDto,
  UpdateQueryDto,
} from './dto/query.dto';
import { NotificationService } from 'src/notifications/notification.service';

@Injectable()
export class QueryService {
  constructor(
    @InjectRepository(CBQuery)
    private queryRepository: Repository<CBQuery>,
    @InjectRepository(CustomBuilder)
    private cbRepository: Repository<CustomBuilder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: string, dto: CreateQueryDto): Promise<QueryResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['createdBy'],
    });
    const cb = await this.cbRepository.findOne({
      where: { id: dto.customBuilderId },
      relations: ['propertyInformation'],
    });

    const query = this.queryRepository.create({
      title: dto.title,
      message: dto.message,
      user,
      customBuilder: cb,
    });

    const saved = await this.queryRepository.save(query);
    if (user.createdById) {
      const message = `New query raised by ${user.fullName || user.email} for property ${cb.propertyInformation?.propertyName || ''}`;
    
      await this.notificationService.createNotification({
        userId: user.createdBy.id,
        message,
      });
    }

    return {
      id: saved.id,
      title: saved.title,
      message: saved.message,
      status: saved.status,
      customBuilderId: cb.id,
      userId: user.id,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async findAllByUser(userId: string): Promise<QueryResponseDto[]> {
    const queries = await this.queryRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'customBuilder'],
      order: { createdAt: 'DESC' },
    });

    return queries.map(mapToQueryResponse);
  }

  async update(id: string, dto: UpdateQueryDto): Promise<QueryResponseDto> {
    const query = await this.queryRepository.findOne({
      where: { id },
      relations: ['user', 'customBuilder'],
    });

    if (!query) {
      throw new NotFoundException(`CBQuery with ID ${id} not found`);
    }

    Object.assign(query, dto);
    const saved = await this.queryRepository.save(query);
    return mapToQueryResponse(saved);
  }

  async findAllByCustomBuilder(
    customBuilderId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<QueryResponseDto[]> {
    const whereCondition: any = {
      customBuilder: { id: customBuilderId },
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      whereCondition.createdAt = Between(start, end);
    }

    const queries = await this.queryRepository.find({
      where: whereCondition,
      relations: ['user', 'customBuilder'],
      order: { createdAt: 'DESC' },
    });

    return queries.map(mapToQueryResponse);
  }

  async findAll(): Promise<QueryResponseDto[]> {
    const queries = await this.queryRepository.find({
      relations: ['user', 'customBuilder'],
      order: { createdAt: 'DESC' },
    });

    return queries.map(mapToQueryResponse);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.queryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CBQuery with ID ${id} not found`);
    }

    return { message: `CBQuery with ID ${id} has been deleted` };
  }
}

export function mapToQueryResponse(query: CBQuery): QueryResponseDto {
    return {
      id: query.id,
      title: query.title,
      message: query.message,
      status: query.status,
      adminReply:query.adminReply,
      customBuilderId: query.customBuilder?.id,
      customBuilderName: query.customBuilder?.propertyInformation?.propertyName || null, // adjust based on your actual field
      userId: query.user?.id,
      userName: query.user?.firstName || query.user?.email || null,
      createdAt: query.createdAt,
      updatedAt: query.updatedAt,
    };
  }
