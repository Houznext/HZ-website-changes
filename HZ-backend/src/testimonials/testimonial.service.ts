import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Testimonials } from './entity/testimonials.entity';
import { Repository } from 'typeorm';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonials.dto';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonials)
    private readonly testimonialRepository: Repository<Testimonials>,
  ) {}

  async create(
    createTestimonailDto: CreateTestimonialDto,
  ): Promise<Testimonials> {
    const testimonial =
      await this.testimonialRepository.create(createTestimonailDto);
    await this.testimonialRepository.save(testimonial);
    return testimonial;
  }

  async findAll(): Promise<Testimonials[]> {
    return this.testimonialRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Testimonials> {
    const testimonial = await this.testimonialRepository.findOne({
        where: { id },
        relations: ['user'],
      });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return testimonial;
  }

  async update(
    id: number,
    updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<Testimonials> {
    const testimonial = await this.testimonialRepository.preload({
      id,
      ...updateTestimonialDto,
    });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return this.testimonialRepository.save(testimonial);
  }
  async remove(id: number): Promise<void> {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);
  }
}
