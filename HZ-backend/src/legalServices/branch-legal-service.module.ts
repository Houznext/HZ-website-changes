import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchLegalService } from './entities/branch-legal-service.entity';
import { BranchLegalServiceController } from './branch-legal-service.controller';
import { BranchLegalServiceService } from './branch-legal-service.service';
import { BranchModule } from '../branch/branch.module';
import { AuthModule } from '../authSession/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchLegalService]),
    forwardRef(() => BranchModule),
    AuthModule,
  ],
  controllers: [BranchLegalServiceController],
  providers: [BranchLegalServiceService],
  exports: [BranchLegalServiceService, TypeOrmModule],
})
export class BranchLegalServiceModule {}
