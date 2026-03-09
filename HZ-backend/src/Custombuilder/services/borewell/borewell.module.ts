import { Module,forwardRef } from '@nestjs/common';
import { BorewellService } from './borewell.service';
import { BorewellController } from './borewell.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borewell } from './entities/borewell.entity';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Borewell, CBService]),forwardRef(() => UserModule),],
  controllers: [BorewellController],
  providers: [BorewellService],
})
export class BorewellModule {}
