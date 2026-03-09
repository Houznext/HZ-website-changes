import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reviews } from './entities/reviews.entity';
import { CreateReviewDto } from './dtos/reviews.dto';

import { Property } from 'src/property/entities/property.entity';
import { HomeDecors } from 'src/homeDecors/entities/homeDecors.entity';
import { Furniture } from 'src/furnitures/entities/furniture.entity';
import { Electronics } from 'src/electronics/entities/electronics.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderItemType } from 'src/orders/enum/order.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Reviews)
    private readonly reviewsRepository: Repository<Reviews>,

    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,

    @InjectRepository(HomeDecors)
    private readonly homeDecorsRepository: Repository<HomeDecors>,

    @InjectRepository(Furniture)
    private readonly furnitureRepository: Repository<Furniture>,

    @InjectRepository(Electronics)
    private readonly electronicsRepository: Repository<Electronics>,


    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  // ---------------- POST REVIEW ----------------
  async postReview(
    userId: string,
    type: string,
    id: string,
    createReviewDto: CreateReviewDto,
  ) {
    const normalizedType = type.toLowerCase();
    let entity: any;

    switch (normalizedType) {
      case 'property':
        entity = await this.propertyRepository.findOne({
          where: { propertyId: id },
        });
        if (!entity) {
          throw new NotFoundException(`No property found with id: ${id}`);
        }
        break;

      case 'homedecor':
        entity = await this.homeDecorsRepository.findOne({ where: { id } });
        if (!entity) {
          throw new NotFoundException(`No homeDecor found with id: ${id}`);
        }
        break;

      case 'furniture':
        entity = await this.furnitureRepository.findOne({ where: { id } });
        if (!entity) {
          throw new NotFoundException(`No furniture found with id: ${id}`);
        }
        break;

      case 'electronics':
        entity = await this.electronicsRepository.findOne({ where: { id } });
        if (!entity) {
          throw new NotFoundException(
            `No Electronic Item found with id: ${id}`,
          );
        }
        break;

      case 'legal':
      case 'interiors':
      case 'solar':
      case 'custombuilder':
        entity = null;
        break;

      default:
        throw new BadRequestException(
          `Invalid type: ${type}. Expected 'property', 'homedecor', 'furniture', 'electronics', 'legal', 'interiors', 'solar' or 'custombuilder'.`,
        );
    }

    // Map incoming `type` to OrderItemType enum
    const productType = this.mapTypeToOrderItemType(normalizedType);
    if (!productType) {
      throw new BadRequestException(`Review not supported for type: ${type}.`);
    }

    // Verify purchase by checking OrderItem
    const hasPurchased = await this.orderItemRepository.findOne({
      where: {
        productType,
        productId: id,
        order: {
          user: { id: userId },
        },
      },
      relations: ['order'],
    });

    if (!hasPurchased) {
      throw new ForbiddenException(
        `You can only review items you have purchased.`,
      );
    }

    // Create a new review
    const review = this.reviewsRepository.create({
      rating: createReviewDto.rating,
      headline: createReviewDto.headline,
      comment: createReviewDto.comment,
      media: createReviewDto.media,
      user: { id: userId },
    });

    // Assign the appropriate entity relationship or service target
    switch (normalizedType) {
      case 'property':
        review.property = entity;
        break;
      case 'homedecor':
        review.homeDecor = entity;
        break;
      case 'furniture':
        review.furniture = entity;
        break;
      case 'electronics':
        review.electronics = entity;
        break;
      case 'legal':
      case 'interiors':
      case 'solar':
      case 'custombuilder':
        review.targetType = productType;
        review.targetId = id;
        break;
    }

    const savedReview = await this.reviewsRepository.save(review);

    return {
      id: savedReview.id,
      rating: savedReview.rating,
      headline: savedReview.headline,
      comment: savedReview.comment,
      media: savedReview.media,
      targetType: savedReview.targetType,
      targetId: savedReview.targetId,
      createdAt: savedReview.createdAt,
      updatedAt: savedReview.updatedAt,
      user: {
        name: savedReview.user?.fullName,
      },
    };
  }

  // ---------------- GET ALL REVIEWS ----------------
  async getAllReviews(type: string, id: string) {
    const normalizedType = type.toLowerCase();
    let reviews: any[];

    switch (normalizedType) {
      case 'property': {
        const property = await this.propertyRepository.findOne({
          where: { propertyId: id },
        });
        if (!property) {
          throw new NotFoundException(`No property found with id: ${id}`);
        }
        reviews = await this.reviewsRepository.find({
          where: { property: { propertyId: id } },
          relations: ['property', 'user'],
        });
        break;
      }

      case 'homedecor': {
        const homeDecor = await this.homeDecorsRepository.findOne({
          where: { id },
        });
        if (!homeDecor) {
          throw new NotFoundException(`No homeDecor found with id: ${id}`);
        }
        reviews = await this.reviewsRepository.find({
          where: { homeDecor: { id } },
          relations: ['homeDecor', 'user'],
        });
        break;
      }

      case 'furniture': {
        const furniture = await this.furnitureRepository.findOne({
          where: { id },
        });
        if (!furniture) {
          throw new NotFoundException(`No furniture found with id: ${id}`);
        }
        reviews = await this.reviewsRepository.find({
          where: { furniture: { id } },
          relations: ['furniture', 'user'],
        });
        break;
      }

      case 'electronics': {
        const electronic = await this.electronicsRepository.findOne({
          where: { id },
        });
        if (!electronic) {
          throw new NotFoundException(
            `No Electronic Product found with id:${id}`,
          );
        }
        reviews = await this.reviewsRepository.find({
          where: { electronics: { id } },
          relations: ['electronics', 'user'],
        });
        break;
      }

      case 'legal':
      case 'interiors':
      case 'solar':
      case 'custombuilder': {
        const productType = this.mapTypeToOrderItemType(normalizedType);
        if (!productType) {
          throw new BadRequestException(`Invalid type: ${type}.`);
        }
        reviews = await this.reviewsRepository.find({
          where: { targetType: productType, targetId: id },
          relations: ['user'],
        });
        break;
      }

      default:
        throw new BadRequestException(
          `Invalid type: ${type}. Expected 'property', 'homedecor', 'furniture', 'electronics', 'legal', 'interiors', 'solar' or 'custombuilder'.`,
        );
    }

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      headline: review.headline,
      comment: review.comment,
      media: review.media,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        name: review.user?.fullName,
      },
    }));

    return { type: normalizedType, id, reviews: formattedReviews };
  }

  // ---------------- DELETE (USER) ----------------
  async deleteReview(userId: string, reviewId: string) {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });
    if (!review) {
      throw new NotFoundException(`No review found with id: ${reviewId}`);
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException(
        `You are not allowed to delete this review.`,
      );
    }

    await this.reviewsRepository.delete(reviewId);

    return {
      message: `Review with id: ${reviewId} has been deleted successfully.`,
    };
  }

  // ---------------- DELETE (ADMIN) ----------------
  async adminDeleteReview(reviewId: string) {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException(`No review found with id: ${reviewId}`);
    }
    await this.reviewsRepository.delete(reviewId);

    return {
      message: `Review with id: ${reviewId} has been deleted successfully.`,
    };
  }

  private mapTypeToOrderItemType(normalizedType: string): OrderItemType | null {
    switch (normalizedType) {
      case 'property':
        return OrderItemType.PROPERTY_BOOKING_TOKEN;
      case 'homedecor':
        return OrderItemType.HOME_DECOR_PRODUCT;
      case 'furniture':
        return OrderItemType.FURNITURE_PRODUCT;
      case 'electronics':
        return OrderItemType.ELECTRONICS_PRODUCT;
      case 'legal':
        return OrderItemType.LEGAL_PACKAGE;
      case 'interiors':
        return OrderItemType.INTERIOR_PACKAGE;
      case 'solar':
        return OrderItemType.SOLAR_PACKAGE;
      case 'custombuilder':
        return OrderItemType.CUSTOM_BUILDER_PACKAGE;
      default:
        return null;
    }
  }
}
