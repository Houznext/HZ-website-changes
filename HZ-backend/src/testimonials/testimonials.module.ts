import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonials.controller';
import { Testimonials } from './entity/testimonials.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonials, User])],
  providers: [TestimonialService],
  controllers: [TestimonialController],
})
export class TestimonialModule {}