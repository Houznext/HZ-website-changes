import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../authSession/auth.module';

import {ServiceCustomLeadController} from './servicecustomlead.controller'
import { ServiceCustomLeadService } from './servicecustomlead.service';
import {ServiceCustomLead} from './entities/servicecustomlead.entity'
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { MailerService } from 'src/sendEmail.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceCustomLead,User]),
    forwardRef(() => UserModule),
     
  ],
  controllers: [ServiceCustomLeadController],
  providers: [ServiceCustomLeadService,MailerService],
  exports:[ServiceCustomLeadService]
  
})
export class ServiceCustomLeadModule {}