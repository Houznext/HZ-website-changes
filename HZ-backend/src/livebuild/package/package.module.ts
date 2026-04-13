import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { Branch } from 'src/branch/entities/branch.entity';
import { AuthModule } from 'src/authSession/auth.module';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Package, Branch]),AuthModule,UserModule],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [TypeOrmModule, PackageService],
})
export class PackageModule {}
