import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Floorplan } from './entities/floorplan.entity';
import { CreateFloorplanDto, UpdateFloorplanDto } from './dto/floorplan.dto';

@Injectable()
export class FloorplansService {
  constructor(
    @InjectRepository(Floorplan)
    private readonly floorplanRepo: Repository<Floorplan>,
  ) {}

  async create(dto: CreateFloorplanDto): Promise<Floorplan> {
    const item = this.floorplanRepo.create(dto);
    return this.floorplanRepo.save(item);
  }

  async findAll(): Promise<Floorplan[]> {
    return this.floorplanRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Floorplan> {
    const item = await this.floorplanRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Floorplan '${id}' not found`);
    return item;
  }

  async findByPlanId(planId: string): Promise<Floorplan[]> {
    return this.floorplanRepo.find({
      where: { planId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateFloorplanDto): Promise<Floorplan> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.floorplanRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.floorplanRepo.remove(item);
  }
}
