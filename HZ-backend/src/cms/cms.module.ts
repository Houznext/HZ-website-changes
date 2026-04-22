import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CmsContent } from './cms.entity';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CmsContent, User])],
  providers: [CmsService],
  controllers: [CmsController],
  exports: [CmsService],
})
export class CmsModule {}
