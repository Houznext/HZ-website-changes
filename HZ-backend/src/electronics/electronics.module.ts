import { TypeOrmModule } from "@nestjs/typeorm";
import { ElectronicsController } from "./electronics.controller";
import { ElectronicsService } from "./electronics.service";
import { Electronics } from "./entities/electronics.entity";
import { ElectronicsVariant } from "./entities/electronics-variant.entity";
import { ElectronicsImage } from "./entities/electronics-image.entity";
import { Module, forwardRef } from "@nestjs/common";
import { Notification } from 'src/notifications/entities/notification.entity';
import { UserModule } from 'src/user/user.module';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([Electronics, ElectronicsVariant, ElectronicsImage, Notification]),
      forwardRef(() => UserModule),
      S3Module,
    ],
    providers: [ElectronicsService],
    controllers: [ElectronicsController],
    exports: [TypeOrmModule]
})
  export class ElectronicsModule {}