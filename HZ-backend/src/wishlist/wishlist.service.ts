import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { WishlistItems } from './entities/wishlistItems.entity';
import { User } from 'src/user/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Property } from 'src/property/entities/property.entity';
import { Furniture } from 'src/furnitures/entities/furniture.entity';
import { HomeDecors } from 'src/homeDecors/entities/homeDecors.entity';
import { Electronics } from 'src/electronics/entities/electronics.entity';

export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItems)
    private readonly wishlistItemsRepository: Repository<WishlistItems>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Furniture)
    private readonly furnituresRepository: Repository<Furniture>,
    @InjectRepository(HomeDecors)
    private readonly homeDecorsRepository: Repository<HomeDecors>,
    @InjectRepository(Electronics)
    private readonly electronicsRepository: Repository<Electronics>,
  ) {}

  //Add to wishlist
  async addToWishlist(userId: string, type: string, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ${userId} not found`);
    }
    let entity: any;

    switch (type) {
      case 'property':
        console.log('propertyId');
        entity = await this.propertyRepository.findOne({
          where: { propertyId: id },
        });
        console.log('propertyId');
        if (!entity)
          throw new NotFoundException(`No property found with id: ${id}`);
        break;

      case 'homeDecor':
        entity = await this.homeDecorsRepository.findOne({ where: { id } });
        if (!entity)
          throw new NotFoundException(`No homeDecor found with id: ${id}`);
        break;

      case 'furniture':
        entity = await this.furnituresRepository.findOne({ where: { id } });
        if (!entity)
          throw new NotFoundException(`No furniture found with id: ${id}`);
        break;

      case 'electronics':
        entity = await this.electronicsRepository.findOne({ where: { id } });
        if (!entity)
          throw new NotFoundException(
            `No Electronic Product found with id:${id}`,
          );
        break;

      default:
        throw new BadRequestException(
          `Invalid type: ${type}. Expected 'property', 'homeDecor', 'furniture' or 'electronics'.`,
        );
    }

    // Check if the user already has a wishlist
    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['wishlistItems'],
    });

    if (!wishlist) {
      // Create a new wishlist if none exists
      wishlist = this.wishlistRepository.create({ user });
      await this.wishlistRepository.save(wishlist);
    }

    console.log('After wishlist');

    // Check if the item is already in the wishlist
    const existingItem = await this.wishlistItemsRepository.findOne({
      where: {
        wishlist: { id: wishlist.id }, // Ensure it belongs to the correct wishlist
        ...(type === 'property' && {
          property: { propertyId: entity.propertyId },
        }),
        ...(type === 'homeDecor' && { homeDecors: { id: entity.id } }),
        ...(type === 'furniture' && { furniture: { id: entity.id } }),
        ...(type === 'electronics' && { electronics: { id: entity.id } }),
      },
      relations: ['property', 'homeDecors', 'furniture', 'electronics'], // Include relations for validation
    });

    if (existingItem) {
      throw new BadRequestException(`Item is already in the wishlist.`);
    }

    console.log('after existing item');
    // Create a new wishlist item
    const wishlistItem = this.wishlistItemsRepository.create({
      wishlist,
    });

    console.log('after wishlistItem');
    // Assign the appropriate entity relationship
    switch (type) {
      case 'property':
        wishlistItem.property = entity;
        break;
      case 'homeDecor':
        wishlistItem.homeDecors = entity;
        break;
      case 'furniture':
        wishlistItem.furniture = entity;
        break;
      case 'electronics':
        wishlistItem.electronics = entity;
        break;
    }

    // Save the wishlist item
    await this.wishlistItemsRepository.save(wishlistItem);

    // Fetch and return the updated wishlist with items
    return this.wishlistRepository.findOne({
      where: { id: wishlist.id },
      relations: [
        'wishlistItems',
        'wishlistItems.property',
        'wishlistItems.homeDecors',
        'wishlistItems.furniture',
        'wishlistItems.electronics',
      ],
    });
  }

  //Delete from wishlist
  async deleteFromWishlist(itemId: string) {
    const wishlistItem = await this.wishlistItemsRepository.findOne({
      where: { id: itemId },
    });

    if (!wishlistItem) {
      throw new NotFoundException(`Wishlist item with ID ${itemId} not found`);
    }
    return this.wishlistItemsRepository.delete(itemId);
  }

  //View WishlistItems
  async viewWishlistItems(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (!user.wishlist) {
      return[];
    }
  

    const wishlist = await this.wishlistRepository.findOne({
      where: { id: user?.wishlist?.id },
      relations: [
        'wishlistItems',
        'wishlistItems.property',
        'wishlistItems.homeDecors',
        'wishlistItems.furniture',
        'wishlistItems.electronics',
      ], // Include necessary relations
    });

    if (!wishlist) {
      throw new NotFoundException(`User has no wishlist`);
    }

    return wishlist.wishlistItems;
  }

  //Adding to cart should be implemented using cart api by fetching items from wishlist.
}
