import { Module ,forwardRef} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlumbingService } from './plumbing.service';
import { PlumbingController } from './plumbing.controller';
import { Plumbing } from './entities/plumbing.entity';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plumbing, CBService]),forwardRef(() => UserModule),],
  controllers: [PlumbingController],
  providers: [PlumbingService],
})
export class PlumbingModule {}
