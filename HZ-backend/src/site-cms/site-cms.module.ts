import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { SiteCmsEntry } from './site-cms.entity';
import { SiteCmsService } from './site-cms.service';
import { SiteCmsController } from './site-cms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteCmsEntry, User])],
  controllers: [SiteCmsController],
  providers: [SiteCmsService],
  exports: [SiteCmsService],
})
export class SiteCmsModule {}
