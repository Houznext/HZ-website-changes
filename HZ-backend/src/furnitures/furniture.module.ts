import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Furniture } from './entities/furniture.entity';
import { FurnitureVariant } from './entities/furniture-variant.entity';
import { FurnitureImage } from './entities/furniture-image.entity';
import { FurnitureController } from './furniture.controller';
import { FurnitureService } from './furniture.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Furniture,
      FurnitureVariant,
      FurnitureImage,
      Notification,
      User,
    ]),
    S3Module,
  ],
  controllers: [FurnitureController],
  providers: [FurnitureService],
  exports: [FurnitureService],
})
export class FurnitureModule {}
