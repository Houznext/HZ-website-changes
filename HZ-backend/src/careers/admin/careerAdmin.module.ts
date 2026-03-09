import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Career } from '../entities/career.entity';
import { JobDepartment } from '../entities/jobDepartment.entity';
import { JobRole } from '../entities/jobRole.entity';
import { CareerAdminController } from './careerAdmin.controller';
import { CareerAdminService } from './careerAdmin.service';
import { Applicant } from '../entities/applicant.entity';
import { UserModule } from 'src/user/user.module';
 

@Module({
    imports: [
        TypeOrmModule.forFeature([Career, JobDepartment, JobRole, Applicant]), forwardRef(() => UserModule), // Register repositories
    ],
    controllers: [CareerAdminController], // Define controllers
    providers: [CareerAdminService], // Define services
    exports: [CareerAdminService], // Export service if other modules need it
})
export class CareerAdminModule {}