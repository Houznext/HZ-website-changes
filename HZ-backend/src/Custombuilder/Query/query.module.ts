import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { User } from 'src/user/entities/user.entity';
import { CBQuery } from './entities/query.entity';
import { NotificationModule } from 'src/notifications/notification.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CBQuery, CustomBuilder, User]),
    NotificationModule,
  ],
  controllers: [QueryController],
  providers: [QueryService],
})
export class QueryModule {}
