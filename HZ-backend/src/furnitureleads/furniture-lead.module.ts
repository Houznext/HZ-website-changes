import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FurnitureLeadService } from './furniture-lead.service';
import { FurnitureLeads } from './entities/furniture-leads.entity';
import { FurnitureLeadsController } from './furniture-lead.controller';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([FurnitureLeads]),forwardRef(() => UserModule),],
    providers: [FurnitureLeadService],
    controllers: [FurnitureLeadsController],
})
export class FurnitureLeadModule { }
