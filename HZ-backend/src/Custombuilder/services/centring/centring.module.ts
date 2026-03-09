import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentringService } from './centring.service';
import { CentringController } from './centring.controller';
import { Centring } from './entities/centring.entity';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Centring, CBService]),forwardRef(() => UserModule)],
  controllers: [CentringController],
  providers: [CentringService],
})
export class CentringModule {}
