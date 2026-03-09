import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { InteriorServiceController } from './interior.controller';
import { InteriorServiceService } from './interior.service';
import { InteriorService } from './entities/interior.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([InteriorService, CBService]),forwardRef(() => UserModule),],
  controllers: [InteriorServiceController],
  providers: [InteriorServiceService],
  exports: [InteriorServiceService],
})
export class InteriorServiceModule {}
