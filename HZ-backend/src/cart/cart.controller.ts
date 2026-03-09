import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';

import { CartService } from './cart.service';
import {
  AddToCartDto,
  SyncCartDto,
  UpdateCartItemDto,
} from './dtos/cart-item.dto';
import { UpdateCartMetaDto } from './dtos/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(ControllerAuthGuard)
  @Get(':userId')
  @ApiOperation({ summary: 'Get cart (creates empty cart if not exists)' })
  getCart(@Param('userId') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @UseGuards(ControllerAuthGuard)
  @Post(':userId/items')
  @ApiOperation({
    summary: 'Add item to cart (merge by productId+variantId+productType)',
  })
  addItem(@Param('userId') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':userId/items/:itemId')
  @ApiOperation({ summary: 'Update a cart item (quantity/price/meta etc.)' })
  updateItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, itemId, dto);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':userId/items/:itemId')
  @ApiOperation({ summary: 'Remove one cart item' })
  removeItem(@Param('userId') userId: string, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':userId/clear')
  @ApiOperation({ summary: 'Clear cart items' })
  clear(@Param('userId') userId: string) {
    return this.cartService.clear(userId);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':userId/meta')
  @ApiOperation({
    summary:
      'Update cart meta: couponCode, shippingDetails, serviceDetails, etc.',
  })
  updateMeta(@Param('userId') userId: string, @Body() dto: UpdateCartMetaDto) {
    return this.cartService.updateMeta(userId, dto);
  }

  // @UseGuards(ControllerAuthGuard)
  @Patch(':userId/sync')
  @ApiOperation({
    summary: 'Replace cart items with given list (sync from frontend)',
  })
  sync(@Param('userId') userId: string, @Body() dto: SyncCartDto) {
    return this.cartService.sync(userId, dto);
  }
}
