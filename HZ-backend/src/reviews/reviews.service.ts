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

import { Furniture } from 'src/furnitures/entities/furniture.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { OrderItemType } from 'src/orders/enum/order.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Reviews)
    private readonly reviewsRepository: Repository<Reviews>,

    @InjectRepository(Furniture)
    private readonly furnitureRepository: Repository<Furniture>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async postReview(
    userId: string,
    type: string,
    id: string,
    createReviewDto: CreateReviewDto,
  ) {
    const normalizedType = type.toLowerCase();
    let entity: any;

    switch (normalizedType) {
      case 'furniture':
        entity = await this.furnitureRepository.findOne({ where: { id } });
        if (!entity) {
          throw new NotFoundException(`No furniture found with id: ${id}`);
        }
        break;

      case 'interiors':
      case 'custombuilder':
        entity = null;
        break;

      default:
        throw new BadRequestException(
          `Invalid type: ${type}. Expected 'furniture', 'interiors', or 'custombuilder'.`,
        );
    }

    const productType = this.mapTypeToOrderItemType(normalizedType);
    if (!productType) {
      throw new BadRequestException(`Review not supported for type: ${type}.`);
    }

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

    const review = this.reviewsRepository.create({
      rating: createReviewDto.rating,
      headline: createReviewDto.headline,
      comment: createReviewDto.comment,
      media: createReviewDto.media,
      user: { id: userId },
    });

    switch (normalizedType) {
      case 'furniture':
        review.furniture = entity;
        break;
      case 'interiors':
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

  async getAllReviews(type: string, id: string) {
    const normalizedType = type.toLowerCase();
    let reviews: any[];

    switch (normalizedType) {
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

      case 'interiors':
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
          `Invalid type: ${type}. Expected 'furniture', 'interiors', or 'custombuilder'.`,
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
      case 'furniture':
        return OrderItemType.FURNITURE_PRODUCT;
      case 'interiors':
        return OrderItemType.INTERIOR_PACKAGE;
      case 'custombuilder':
        return OrderItemType.CUSTOM_BUILDER_PACKAGE;
      default:
        return null;
    }
  }
}
