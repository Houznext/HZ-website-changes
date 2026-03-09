import { TypeOrmModule } from "@nestjs/typeorm";
import { HomeDecors } from "./entities/homeDecors.entity";
import { Module,forwardRef } from "@nestjs/common";
import { Notification } from 'src/notifications/entities/notification.entity';
import { HomeDecorController } from "./homeDecors.controller";
import { HomeDecorService } from "./homeDecors.service";
 import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([HomeDecors, Notification]),forwardRef(() => UserModule),],
    providers: [HomeDecorService],
    controllers: [HomeDecorController],
    exports: [TypeOrmModule]
  })
  export class HomeDecorsModule {}