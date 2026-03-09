import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentDraftingService } from './documentDrafting.service';
import { DocumentDraftingController } from './documentDrafting.controller';
import { DocumentDrafting } from './entities/documentDrafting.entity';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentDrafting, CBService]),forwardRef(() => UserModule),],
  controllers: [DocumentDraftingController],
  providers: [DocumentDraftingService],
})
export class DocumentDraftingModule {}
