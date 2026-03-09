import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FallCeilingService } from './fallCeiling.service';
import { FallCeilingController } from './fallCeiling.controller';
import { FallCeiling } from './entities/fallCeiling.entity';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([FallCeiling, CBService]),forwardRef(() => UserModule),],
  controllers: [FallCeilingController],
  providers: [FallCeilingService],
})
export class FallCeilingModule {}
