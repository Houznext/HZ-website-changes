import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CBProperty } from './entities/cb-property.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { CBPropertyController } from './custom-property.controller';
import { CBPropertyService } from './custom-property.service';
import { CBFloor } from '../floor/entities/floor.entity';
import { HouseConstruction } from './entities/house-construction.entity';
import { InteriorInfo } from './entities/interior-info.entity';
import { CommercialConstruction } from './entities/commercial-construction.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomBuilder,
      CBProperty,
      HouseConstruction,
      InteriorInfo,
      CommercialConstruction,
      CBFloor,
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [CBPropertyController],
  providers: [CBPropertyService],
})
export class CustomPropertyModule {}
