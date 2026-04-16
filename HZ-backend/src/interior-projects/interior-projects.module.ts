import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteriorProject } from './entities/interior-project.entity';
import { InteriorProjectsService } from './interior-projects.service';
import { InteriorProjectsController } from './interior-projects.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InteriorProject, User])],
  controllers: [InteriorProjectsController],
  providers: [InteriorProjectsService],
  exports: [InteriorProjectsService],
})
export class InteriorProjectsModule {}
