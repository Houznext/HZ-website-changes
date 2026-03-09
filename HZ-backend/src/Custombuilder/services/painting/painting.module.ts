import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Painting } from './entities/painting.entity';
import { PaintingService } from './painting.service';
import { PaintingController } from './painting.controller';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Painting, CBService]),forwardRef(() => UserModule),],
  providers: [PaintingService],
  controllers: [PaintingController],
})
export class PaintingModule {}
