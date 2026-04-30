import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnyAuthGuard } from 'src/common/guards/any-auth.guard';

@Controller('/wishlist')
@ApiTags('Wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}
  @UseGuards(AnyAuthGuard)
  @Post('/:userId/:type/:id')
  @ApiOperation({
    summary: "Add an item to a user's wishlist",
    description:
      'Adds a property, home decor, or furniture item to the wishlist of a specified user.',
  })
  async addToWishlist(
    @Param('userId') userId: string,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    if (!['property', 'homeDecor', 'furniture'].includes(type)) {
      throw new BadRequestException(
        `Invalid type: ${type}. Allowed values are 'property', 'homeDecor', or 'furniture'.`,
      );
    }
    return this.wishlistService.addToWishlist(userId, type, id);
  }
  @UseGuards(AnyAuthGuard)
  @Delete('/:itemId')
  @ApiOperation({
    summary: "Delete an item from user's wishlist",
  })
  async deleteFromWishlist(@Param('itemId') itemId: string) {
    return this.wishlistService.deleteFromWishlist(itemId);
  }

  @UseGuards(AnyAuthGuard)
  @Get('/:userId')
  @ApiOperation({ summary: 'Feth all items in wishlist' })
  async getAllItems(@Param('userId') userId: string) {
    return this.wishlistService.viewWishlistItems(userId);
  }
}
