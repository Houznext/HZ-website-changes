import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreatePopularLocalityDto,
  UpdatePopularLocalityDto,
} from './dto/popular-locality.dto';
import { PopularLocality } from './entity/popular-locality';

@Injectable()
export class PopularLocalityService {
  constructor(
    @InjectRepository(PopularLocality)
    private readonly localityRepo: Repository<PopularLocality>,
  ) {}

  async create(dto: CreatePopularLocalityDto) {
    const exists = await this.localityRepo.findOne({
      where: {
        name: dto.name,
        city: dto.city,
      },
    });

    if (exists) {
      throw new BadRequestException(
        `Locality "${dto.name}" in city "${dto.city}" already exists.`,
      );
    }

    const newLocality = this.localityRepo.create(dto);
    return await this.localityRepo.save(newLocality);
  }

  async findAll(city?: string) {
    const where = city ? { city } : {};
    return await this.localityRepo.find({ where });
  }

  async findOne(id: number) {
    const locality = await this.localityRepo.findOne({ where: { id } });
    if (!locality) throw new NotFoundException('Locality not found');
    return locality;
  }

  async update(id: number, dto: UpdatePopularLocalityDto) {
    const locality = await this.findOne(id);

    const duplicate = await this.localityRepo.findOne({
      where: {
        name: dto.name,
        city: dto.city,
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException(
        `Another locality "${dto.name}" in city "${dto.city}" already exists.`,
      );
    }

    Object.assign(locality, dto);
    return await this.localityRepo.save(locality);
  }

  async remove(id: number) {
    const locality = await this.findOne(id);
    return await this.localityRepo.remove(locality);
  }
}
