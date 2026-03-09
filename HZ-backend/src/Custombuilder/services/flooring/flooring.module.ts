import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlooringService } from './flooring.service';
import { FlooringController } from './flooring.controller';
import { Flooring } from './entities/flooring.entity';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Flooring, CBService]),forwardRef(() => UserModule),],
  controllers: [FlooringController],
  providers: [FlooringService],
})
export class FlooringModule {}
