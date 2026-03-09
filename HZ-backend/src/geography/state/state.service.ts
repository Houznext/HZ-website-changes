import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
import { State } from './entities/state.entity';

@Injectable()
export class StateService {
  constructor(@InjectRepository(State) private readonly stateRepo: Repository<State>) {}

  async create(dto: CreateStateDto) {
    const exists = await this.stateRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new BadRequestException(`State '${dto.name}' already exists`);
    return this.stateRepo.save(this.stateRepo.create(dto));
  }

  async update(id: number, dto: UpdateStateDto) {
    const st = await this.stateRepo.findOne({ where: { id } });
    if (!st) throw new NotFoundException('State not found');

    if (dto.name && dto.name !== st.name) {
      const dup = await this.stateRepo.findOne({ where: { name: dto.name } });
      if (dup) throw new BadRequestException(`State '${dto.name}' already exists`);
    }

    Object.assign(st, dto);
    return this.stateRepo.save(st);
  }

  async delete(id: number) {
    const st = await this.stateRepo.findOne({ where: { id } });
    if (!st) throw new NotFoundException('State not found');
    await this.stateRepo.delete(id);
    return { success: true };
  }

  async findAll() {
    return this.stateRepo.find({ order: { name: 'ASC' } });
  }

  async findById(id: number) {
    const st = await this.stateRepo.findOne({ where: { id } });
    if (!st) throw new NotFoundException('State not found');
    return st;
  }
}
