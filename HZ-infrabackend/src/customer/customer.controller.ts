import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { RegisterCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomerGuard } from '../common/guards/customer.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customers: CustomerService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterCustomerDto) {
    return this.customers.register(user.sub, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: JwtPayload) {
    return this.customers.me(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  patchMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCustomerDto) {
    return this.customers.updateMe(user.sub, dto);
  }
}
