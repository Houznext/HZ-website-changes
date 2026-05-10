import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { InfraEnquiry } from '../enquiry/entities/infra-enquiry.entity';
import { CreatePropertyDto } from '../property/dto/create-property.dto';
import { UpdatePropertyDto } from '../property/dto/update-property.dto';
import { JwtPayload } from '../auth/jwt.strategy';
import { PropertyService } from '../property/property.service';

@Injectable()
export class DeveloperService {
  constructor(
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
    @InjectRepository(InfraEnquiry)
    private readonly enqRepo: Repository<InfraEnquiry>,
    private readonly propertyService: PropertyService,
  ) {}

  async myListings(devId: string) {
    return this.propRepo.find({
      where: { listedBy: 'developer', listedByUserId: devId },
      relations: { media: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createListing(devId: string, dto: CreatePropertyDto) {
    const u: JwtPayload = { sub: devId, kind: 'developer' };
    return this.propertyService.create({ ...dto, listedBy: 'developer' }, u);
  }

  async updateListing(devId: string, id: string, dto: UpdatePropertyDto) {
    const u: JwtPayload = { sub: devId, kind: 'developer' };
    return this.propertyService.update(id, dto, u);
  }

  async myEnquiries(devId: string) {
    const props = await this.propRepo.find({
      where: { listedBy: 'developer', listedByUserId: devId },
      select: ['propertyId'],
    });
    const ids = props.map((p) => p.propertyId);
    if (!ids.length) return [];
    return this.enqRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.property', 'p')
      .where('p.propertyId IN (:...ids)', { ids })
      .orderBy('e.createdAt', 'DESC')
      .getMany();
  }

  async stats(devId: string) {
    const listings = await this.propRepo.count({
      where: { listedBy: 'developer', listedByUserId: devId },
    });
    const enqs = await this.enqRepo
      .createQueryBuilder('e')
      .innerJoin('e.property', 'p')
      .where('p.listedBy = :lb AND p.listedByUserId = :uid', { lb: 'developer', uid: devId })
      .getCount();
    return { totalListings: listings, enquiries: enqs, views: 0 };
  }
}
