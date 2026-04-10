import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteriorPackage } from './entities/interior-package.entity';
import { InteriorPackagesService } from './interior-packages.service';
import { InteriorPackagesController } from './interior-packages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InteriorPackage])],
  providers: [InteriorPackagesService],
  controllers: [InteriorPackagesController],
  exports: [InteriorPackagesService],
})
export class InteriorPackagesModule {}
