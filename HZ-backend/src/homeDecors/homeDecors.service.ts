import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateHomeDecoreDto,
  ReturnHomeDecoreDto,
  UpdateHomeDecorDto,
} from './dto/homeDecor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeDecors } from './entities/homeDecors.entity';
import { Repository } from 'typeorm';
import { Notification } from 'src/notifications/entities/notification.entity';
import { HomeDecorsCategory, SortOption } from './enum/homeDecors.enum';
import { plainToInstance } from 'class-transformer';
import { Branch } from 'src/branch/entities/branch.entity';
import { SEED_HOME_DECOR, buildHomeDecorDto } from './home-decor-seed-data';

@Injectable()
export class HomeDecorService {
  constructor(
    @InjectRepository(HomeDecors)
    private readonly homeDecoreRepository: Repository<HomeDecors>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) { }

  async createHomeDecor(
    createHomeDecoreDto: CreateHomeDecoreDto,
  ): Promise<HomeDecors> {

    const { createdById } = createHomeDecoreDto;
    const homeDecor = this.homeDecoreRepository.create(createHomeDecoreDto);
    await this.homeDecoreRepository.save(homeDecor);

    const notification = this.notificationRepository.create({
      message: 'New Home Decor added',
      userId: createdById,
    });
    await this.notificationRepository.save(notification);

    return homeDecor;
  }

  async findOne(id: string): Promise<HomeDecors> {
    return await this.homeDecoreRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateHomeDecorDto: UpdateHomeDecorDto,
  ): Promise<HomeDecors> {
    await this.homeDecoreRepository.update(id, updateHomeDecorDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.homeDecoreRepository.delete(id);
  }

  async findAll(
    categories?: string[],
    sort?: string,
    minPrice?: number,
    maxPrice?: number,
    search?: string,
    discount?: number,
    page?: number,
    branchId?: string,
  ): Promise<{
    data: ReturnHomeDecoreDto[];
    total: number;
    currentPage: number;
    totalPages: number;
    allCategories: string[];
    allColors: string[];
    maximumPrice: number;
  }> {
    const limit: number = 10; // Default to 20 items per page

    page = Number(page) || 1;

    const queryBuilder =
      this.homeDecoreRepository.createQueryBuilder('homeDecor');

    if (branchId) {
      queryBuilder.andWhere('homeDecor.branchId = :branchId', { branchId });
    }

    // Filter by categories
    if (categories && categories.length > 0) {
      const validCategories = categories.map((category) => {
        const categoryLowerCase = category?.toLowerCase();
        const categoryEnum = Object.values(HomeDecorsCategory).find(
          (value) => value.toLowerCase() === categoryLowerCase,
        );
        if (!categoryEnum) {
          throw new HttpException(
            `Invalid category: ${category}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        return categoryEnum;
      });

      queryBuilder.andWhere('homeDecor.category IN (:...categories)', {
        categories: validCategories,
      });
    }

    // Search by name
    if (search) {
      queryBuilder.andWhere('LOWER(homeDecor.name) LIKE :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    // Filter by price range
    // Parse and validate price values
    const parsedMinPrice =
      minPrice !== undefined
        ? parseFloat(minPrice as unknown as string)
        : undefined;
    const parsedMaxPrice =
      maxPrice !== undefined
        ? parseFloat(maxPrice as unknown as string)
        : undefined;

    const fallbackMinPrice = !isNaN(parsedMinPrice) ? parsedMinPrice : 0; // Default to 0
    const fallbackMaxPrice = !isNaN(parsedMaxPrice) ? parsedMaxPrice : 1000000; // Default to a large value

    queryBuilder.andWhere('(homeDecor.price - (homeDecor.price * (homeDecor.discount / 100))) BETWEEN :minPrice AND :maxPrice', {
      minPrice: fallbackMinPrice,
      maxPrice: fallbackMaxPrice,
    });

    // Filter by discount
    const parsedDiscount =
      discount !== undefined
        ? parseFloat(discount as unknown as string)
        : undefined;
    const fallbackDiscount = !isNaN(parsedDiscount) ? parsedDiscount : 0;

    queryBuilder.andWhere('homeDecor.discount >= :discount', {
      discount: fallbackDiscount,
    });

    switch (sort) {
      case 'Popularity':
        queryBuilder.orderBy('homeDecor.rating', 'DESC');
        break;
      case 'Latest':
        queryBuilder.orderBy('homeDecor.createdDate', 'DESC');
        break;
      case 'Price Low High':
        queryBuilder.orderBy('homeDecor.price', 'ASC');
        break;
      case 'Price High Low':
        queryBuilder.orderBy('homeDecor.price', 'DESC');
        break;
      case 'Discount':
        queryBuilder.orderBy('homeDecor.discount', 'ASC');
        break;
      default:
        queryBuilder.orderBy('homeDecor.createdDate', 'DESC'); // Default sorting
        break;
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    console.log('Query builder sql-----------:' + queryBuilder.getSql());

    // Get total count for pagination
    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    // Execute the query
    const data = await queryBuilder.getMany();

    // Reapply filters for fetching distinct colors
    const colorsQueryBuilder =
      this.homeDecoreRepository.createQueryBuilder('homeDecor');
    if (categories && categories.length > 0) {
      colorsQueryBuilder.andWhere('homeDecor.category IN (:...categories)', {
        categories,
      });
    }

    if (search) {
      colorsQueryBuilder.andWhere('LOWER(homeDecor.name) LIKE :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    colorsQueryBuilder.andWhere(
      '(homeDecor.price - (homeDecor.price * (homeDecor.discount / 100))) BETWEEN :minPrice AND :maxPrice',
      {
        minPrice: fallbackMinPrice,
        maxPrice: fallbackMaxPrice,
      },
    );

    colorsQueryBuilder.andWhere('homeDecor.discount >= :discount', {
      discount: fallbackDiscount,
    });

    const allColorsResult = await colorsQueryBuilder
      .select('DISTINCT homeDecor.color', 'color')
      .getRawMany();

    const allColors = allColorsResult.map((row) => row.color);

    // Reapply filters for fetching max price
    const maxPriceQueryBuilder =
      this.homeDecoreRepository.createQueryBuilder('homeDecor');
    if (categories && categories.length > 0) {
      maxPriceQueryBuilder.andWhere('homeDecor.category IN (:...categories)', {
        categories,
      });
    }

    if (search) {
      maxPriceQueryBuilder.andWhere('LOWER(homeDecor.name) LIKE :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }


    maxPriceQueryBuilder.andWhere('homeDecor.discount >= :discount', {
      discount: fallbackDiscount,
    });

    const maxPriceResult = await maxPriceQueryBuilder
      .select('MAX(homeDecor.price)', 'maxPrice')
      .getRawOne();

    const maximumPrice = parseFloat(maxPriceResult?.maxPrice || '0');

    // Fetch all available categories, colors, and max price
    const allCategories = await this.homeDecoreRepository
      .createQueryBuilder('homeDecor')
      .select('DISTINCT homeDecor.category', 'category')
      .getRawMany();

    const transformedData = plainToInstance(ReturnHomeDecoreDto, data, {
      excludeExtraneousValues: true,
    });

    // Return paginated data with metadata
    return {
      data: transformedData,
      total,
      currentPage: page,
      totalPages,
      allCategories: allCategories.map((c) => c.category),
      allColors, // Colors based on filtered items
      maximumPrice, // Max price based on filtered items
    };
  }

  async seedHomeDecor(userId: string, branchId?: string): Promise<{ created: number; failed: number }> {
    if (!branchId) {
      const orgBranch = await this.homeDecoreRepository.manager
        .getRepository(Branch)
        .findOne({ where: { level: 'ORG' as any } });
      branchId = orgBranch?.id;
    }
    let created = 0;
    let failed = 0;
    for (let i = 0; i < SEED_HOME_DECOR.length; i++) {
      const item = SEED_HOME_DECOR[i];
      try {
        const dto = { ...buildHomeDecorDto(item, userId, i), branchId } as CreateHomeDecoreDto;
        await this.createHomeDecor(dto);
        created++;
      } catch (err) {
        console.error(`[SeedHomeDecor] Failed "${item.name}":`, err?.message ?? err);
        failed++;
      }
    }
    return { created, failed };
  }
}
