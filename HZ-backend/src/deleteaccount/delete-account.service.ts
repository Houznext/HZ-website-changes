import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Property } from 'src/property/entities/property.entity';
import { Blog } from 'src/blog/entities/blog.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Testimonials } from 'src/testimonials/entity/testimonials.entity';

export class DeleteAccountService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Property) private propertyRepo: Repository<Property>,
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    @InjectRepository(Testimonials)
    private testimonialRepo: Repository<Testimonials>,
  ) {}
  async deleteUserAccount(userId: string, deleteAccountDto: { reason: string; description?: string }): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'properties',
        'createdBlogs',
        'updatedBlogs',
        'testimonials',
        'cart',
        'wishlist',
        'reviews',
        'orders',
        'addresses',
        'costEstimators',
        'customBuilders',
        'project',
        'company'
      ],
    });
  
    if (!user) throw new NotFoundException('User not found');
  
    console.log(`Deleting user ${userId} for reason: ${deleteAccountDto.reason}, description: ${deleteAccountDto.description}`);
  
    await this.userRepository.remove(user);
    return `User account with ID ${userId} deleted successfully.`;
  }
  

  async getAccountSummary(userId: string) {
    if (!userId) {
      throw new BadRequestException('Invalid userId');
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'properties',
        'createdBlogs',
        'updatedBlogs',
        'testimonials',
        'cart',
        'wishlist',
        'orders',
        'addresses',
        'customBuilders',
        'costEstimators',
        'project',
        'company',
      ],
    });

    

    if (!user) {
      throw new NotFoundException('User not found');
    }    

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      associatedData: {
        properties: user?.properties?.length,
        blogsCreated: user?.createdBlogs?.length,
        testimonials: user?.testimonials?.length,
        orders: user?.orders?.length,
        locations: user?.locations?.length,
        customBuilders: user?.customBuilders?.length,
        costEstimators: user?.costEstimators?.length,
        crmLeads: user?.crmLeads?.length,
        hasCart: !!user?.cart,
        hasWishlist: !!user?.wishlist,
        hasProject: !!user?.project,
        hasCompany: !!user?.company,
      },
    };
  }
}
