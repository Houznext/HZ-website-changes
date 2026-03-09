import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { State } from 'src/geography/state/entities/state.entity';
import {
  CreateCityDto,
  ListCitiesQueryDto,
  UpdateCityDto,
} from './dto/city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City) private readonly cityRepo: Repository<City>,
    @InjectRepository(State) private readonly stateRepo: Repository<State>,
  ) {}

  async create(dto: CreateCityDto) {
    const st = await this.stateRepo.findOne({ where: { id: dto.stateId } });
    if (!st) throw new BadRequestException('Invalid stateId');
    const city = this.cityRepo.create({ name: dto.name, state: st });
    return this.cityRepo.save(city);
  }

  async update(id: number, dto: UpdateCityDto) {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city) throw new NotFoundException('City not found');

    if (dto.name) city.name = dto.name;
    if (dto.stateId) {
      const st = await this.stateRepo.findOne({ where: { id: dto.stateId } });
      if (!st) throw new BadRequestException('Invalid stateId');
      city.state = st;
    }
    return this.cityRepo.save(city);
  }

  async delete(id: number) {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city) throw new NotFoundException('City not found');
    await this.cityRepo.delete(id);
    return { success: true };
  }

  async findAll(q: ListCitiesQueryDto) {
    const qb = this.cityRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.state', 's')
      .orderBy('c.name', 'ASC');

    if (q?.stateId) qb.andWhere('s.id = :sid', { sid: q.stateId });
    if (q?.q)
      qb.andWhere('LOWER(c.name) LIKE :kw', { kw: `%${q.q.toLowerCase()}%` });

    return qb.getMany();
  }

  async findById(id: number) {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }
}
