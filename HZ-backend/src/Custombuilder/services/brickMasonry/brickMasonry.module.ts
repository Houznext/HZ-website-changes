import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrickMasonryService } from './brickMasonry.service';
import { BrickMasonryController } from './brickMasonry.controller';
import { BrickMasonry } from './entities/brickMasonry.entity';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BrickMasonry, CBService]),forwardRef(() => UserModule),],
  controllers: [BrickMasonryController],
  providers: [BrickMasonryService],
})
export class BrickMasonryModule {}
