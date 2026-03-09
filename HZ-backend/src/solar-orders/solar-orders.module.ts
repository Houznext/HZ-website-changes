import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolarInstallationDetail } from './entities/solar-installation-detail.entity';
import { SolarOrdersService } from './solar-orders.service';
import { SolarOrdersController } from './solar-orders.controller';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SolarInstallationDetail, Order, User])],
    controllers: [SolarOrdersController],
    providers: [SolarOrdersService],
    exports: [SolarOrdersService],
})
export class SolarOrdersModule { }
