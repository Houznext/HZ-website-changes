import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { State } from './entities/state.entity';
import { AuthModule } from 'src/authSession/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([State]),AuthModule,UserModule],
  providers: [StateService],
  controllers: [StateController],
  exports: [TypeOrmModule, StateService],
})
export class StateModule {}
