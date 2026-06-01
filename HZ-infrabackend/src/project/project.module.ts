import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraProject } from './entities/infra-project.entity';
import { InfraProjectMilestone } from './entities/infra-project-milestone.entity';
import { InfraMailService } from '../common/mail/infra-mail.service';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { AdminProjectController } from './admin-project.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraProject, InfraProjectMilestone])],
  controllers: [ProjectController, AdminProjectController],
  providers: [ProjectService, InfraMailService],
  exports: [ProjectService],
})
export class ProjectModule {}
