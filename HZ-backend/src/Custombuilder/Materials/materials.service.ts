
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/materials.entity';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/materials.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material) private matRepo: Repository<Material>,
    @InjectRepository(CustomBuilder) private cbRepo: Repository<CustomBuilder>,
  ) {}

  private async mustGetCB(cbId: string) {
    const cb = await this.cbRepo.findOne({ where: { id: cbId } });
    if (!cb) throw new NotFoundException('Project not found');
    return cb;
  }

  async create(cbId: string, dto: CreateMaterialDto, user: User) {
    const cb = await this.mustGetCB(cbId);
    const mat = this.matRepo.create({ ...dto, cb, uploadedBy: user, images: dto.images ?? [] });
    return this.matRepo.save(mat);
  }

  async list(cbId: string) {
    return this.matRepo.find({
      where: { cb: { id: cbId } },
      relations: ['uploadedBy', 'checkedBy'],
      order: { createdAt: 'DESC' },
    });
  }
  

async getById(id: string) {
  const mat = await this.matRepo.findOne({
    where: { id },
    relations: ['cb', 'uploadedBy', 'checkedBy'],
  });
  if (!mat) throw new NotFoundException('Material not found');
  return mat;
}


  async update(id: string, dto: UpdateMaterialDto, user: User) {
    const mat = await this.matRepo.findOne({ where: { id }, relations: ['cb'] });
    if (!mat) throw new NotFoundException('Material not found');
    Object.assign(mat, dto, { updatedBy: user });
    return this.matRepo.save(mat);
  }

  
async check(id: string, user: User) {
  const mat = await this.matRepo.findOne({ where: { id }, relations: ['checkedBy', 'uploadedBy', 'cb'] });
  if (!mat) throw new NotFoundException('Material not found');

  mat.checkedBy = user;
  mat.checkedAt = new Date();
  await this.matRepo.save(mat);

  return this.matRepo.findOne({
    where: { id },
    relations: ['checkedBy', 'uploadedBy', 'cb'],
  });
}



  async delete(id: string) {
  const mat = await this.matRepo.findOne({ where: { id } });
  if (!mat) throw new NotFoundException('Material not found');
  await this.matRepo.remove(mat);
  return { message: 'Material deleted successfully' };
}

}
