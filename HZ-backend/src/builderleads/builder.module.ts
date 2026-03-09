import { Module ,forwardRef} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuilderLeads } from './Entity/builderlead.entity';
import { BuilderLeadsController } from './builder.controller';
import { BuilderLeadsService } from './builder.service';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [TypeOrmModule.forFeature([BuilderLeads]),forwardRef(() => UserModule),],
  controllers: [BuilderLeadsController],
  providers: [BuilderLeadsService],
  exports: [BuilderLeadsService], 
})
export class BuilderLeadsModule {}
