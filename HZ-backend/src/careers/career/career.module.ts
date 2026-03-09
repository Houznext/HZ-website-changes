import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Career } from '../entities/career.entity';
import { Applicant } from '../entities/applicant.entity';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
 import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Career, Applicant ]),forwardRef(() => UserModule),],
    controllers: [CareerController],
    providers: [CareerService],
})
export class CareerModule {}