import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { WishlistItems } from './entities/wishlistItems.entity';
import { User } from 'src/user/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Furniture } from 'src/furnitures/entities/furniture.entity';

export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItems)
    private readonly wishlistItemsRepository: Repository<WishlistItems>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Furniture)
    private readonly furnituresRepository: Repository<Furniture>,
  ) {}

  async addToWishlist(userId: string, type: string, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ${userId} not found`);
    }
    let entity: Furniture;

    switch (type) {
      case 'furniture':
        entity = await this.furnituresRepository.findOne({ where: { id } });
        if (!entity)
          throw new NotFoundException(`No furniture found with id: ${id}`);
        break;

      default:
        throw new BadRequestException(
          `Invalid type: ${type}. Expected 'furniture'.`,
        );
    }

    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['wishlistItems'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({ user });
      await this.wishlistRepository.save(wishlist);
    }

    const existingItem = await this.wishlistItemsRepository.findOne({
      where: {
        wishlist: { id: wishlist.id },
        furniture: { id: entity.id },
      },
      relations: ['furniture'],
    });

    if (existingItem) {
      throw new BadRequestException(`Item is already in the wishlist.`);
    }

    const wishlistItem = this.wishlistItemsRepository.create({
      wishlist,
      furniture: entity,
    });

    await this.wishlistItemsRepository.save(wishlistItem);

    return this.wishlistRepository.findOne({
      where: { id: wishlist.id },
      relations: ['wishlistItems', 'wishlistItems.furniture'],
    });
  }

  async deleteFromWishlist(itemId: string) {
    const wishlistItem = await this.wishlistItemsRepository.findOne({
      where: { id: itemId },
    });

    if (!wishlistItem) {
      throw new NotFoundException(`Wishlist item with ID ${itemId} not found`);
    }
    return this.wishlistItemsRepository.delete(itemId);
  }

  async viewWishlistItems(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (!user.wishlist) {
      return [];
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { id: user?.wishlist?.id },
      relations: ['wishlistItems', 'wishlistItems.furniture'],
    });

    if (!wishlist) {
      throw new NotFoundException(`User has no wishlist`);
    }

    return wishlist.wishlistItems;
  }
}
