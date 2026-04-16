import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { CarouselSettings } from './entities/carousel-settings.entity';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class HeroCarouselService {
  constructor(
    @InjectRepository(HeroSlide)
    private slideRepo: Repository<HeroSlide>,
    @InjectRepository(CarouselSettings)
    private settingsRepo: Repository<CarouselSettings>,
  ) {}

  async getPublicSlides(): Promise<{
    slides: HeroSlide[];
    settings: CarouselSettings;
  }> {
    const slides = await this.slideRepo.find({
      where: { active: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    const settings = await this.getOrCreateSettings();
    return { slides, settings };
  }

  async getAllSlides(): Promise<HeroSlide[]> {
    return this.slideRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async createSlide(dto: CreateSlideDto): Promise<HeroSlide> {
    const count = await this.slideRepo.count();
    const slide = this.slideRepo.create({
      ...dto,
      sortOrder: dto.sortOrder ?? count,
    });
    return this.slideRepo.save(slide);
  }

  async updateSlide(id: number, dto: UpdateSlideDto): Promise<HeroSlide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException(`Slide ${id} not found`);
    Object.assign(slide, dto);
    return this.slideRepo.save(slide);
  }

  async deleteSlide(id: number): Promise<{ success: boolean }> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException(`Slide ${id} not found`);
    await this.slideRepo.delete(id);
    return { success: true };
  }

  async reorderSlides(orderedIds: number[]): Promise<HeroSlide[]> {
    const updates = orderedIds.map((id, index) =>
      this.slideRepo.update(id, { sortOrder: index }),
    );
    await Promise.all(updates);
    return this.getAllSlides();
  }

  async getOrCreateSettings(): Promise<CarouselSettings> {
    let settings = await this.settingsRepo.findOne({
      where: { id: 1 },
    });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 1 });
      settings = await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<CarouselSettings> {
    await this.getOrCreateSettings();
    await this.settingsRepo.update(1, dto);
    return this.settingsRepo.findOne({ where: { id: 1 } });
  }
}
