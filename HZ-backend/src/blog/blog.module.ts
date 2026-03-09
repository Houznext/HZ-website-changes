import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/authSession/auth.module';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog]),
    UserModule,
    AuthModule,
    S3Module,
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
