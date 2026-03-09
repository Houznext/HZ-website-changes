import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entity/package.entity';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { ConstructionScope } from 'src/Custombuilder/custom-property/enum/custom-property.enum';
import { Branch } from 'src/branch/entities/branch.entity';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    @InjectRepository(Branch) private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreatePackageDto) {
    const branch = await this.branchRepo.findOne({
      where: { id: dto.branchId },
    });
    if (!branch) throw new BadRequestException('Invalid branchId');

    const existing = await this.packageRepo.findOne({
      where: {
        name: dto.name,
        branch: { id: dto.branchId },
        construction_scope: dto.construction_scope ?? null,
      },
      relations: ['branch'],
    });
    if (existing) {
      throw new BadRequestException(
        `Package '${dto.name}' already exists for this branch${dto.construction_scope ? ` and scope '${dto.construction_scope}'` : ''}.`,
      );
    }

    const pkg = this.packageRepo.create({
      name: dto.name,
      ratePerSqft: dto.ratePerSqft,
      features: dto.features,
      branch,
      construction_scope: dto.construction_scope ?? null,
    });

    return this.packageRepo.save(pkg);
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['branch'],
    });
    if (!pkg) throw new NotFoundException('Package not found');

    if (dto.branchId && dto.branchId !== pkg.branch.id) {
      const newBranch = await this.branchRepo.findOne({
        where: { id: dto.branchId },
      });
      if (!newBranch) throw new BadRequestException('Invalid branchId');
      pkg.branch = newBranch;
    }

    if (dto.name !== undefined) pkg.name = dto.name;
    if (dto.ratePerSqft !== undefined) pkg.ratePerSqft = dto.ratePerSqft;
    if (dto.features !== undefined) pkg.features = dto.features;
    if (dto.construction_scope !== undefined)
      pkg.construction_scope = dto.construction_scope;

    // enforce uniqueness on update
    const dupe = await this.packageRepo.findOne({
      where: {
        name: pkg.name,
        branch: { id: pkg.branch.id },
        construction_scope: pkg.construction_scope ?? null,
      },
      relations: ['branch'],
    });
    if (dupe && dupe.id !== pkg.id) {
      throw new BadRequestException(
        `Another package with the same name already exists for this branch${pkg.construction_scope ? ` and scope '${pkg.construction_scope}'` : ''}.`,
      );
    }

    return this.packageRepo.save(pkg);
  }

  async findAll() {
    return this.packageRepo.find({ relations: ['branch'] });
  }

  async findByBranch(branchId: string) {
    return this.packageRepo.find({
      where: { branch: { id: branchId } },
      relations: ['branch'],
      order: { name: 'ASC' },
    });
  }

  async findByBranchAndScope(branchId: string, scope: ConstructionScope) {
    return this.packageRepo.find({
      where: {
        branch: { id: branchId },
        construction_scope: scope,
      },
      relations: ['branch'],
      order: { name: 'ASC' },
    });
  }

  async delete(id: string) {
    const ok = await this.packageRepo.findOne({ where: { id } });
    if (!ok) throw new NotFoundException('Package not found');
    await this.packageRepo.delete(id);
    return { success: true };
  }
}
