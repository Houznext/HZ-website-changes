import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeleteAccountService } from './delete-account.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ControllerAuthGuard } from 'src/guard';

@Controller('delete-account')
@ApiTags('Delete Account')
export class DeleteAccountController {
  constructor(private readonly deleteAccountService: DeleteAccountService) {}

  @Get(':userId/summary')
  @ApiOperation({ summary: 'Get summary details of a user' })
  @ApiResponse({ status: 200, description: 'User summary details' })
  async getUserSummary(@Param('userId') userId: string) {
    return this.deleteAccountService.getAccountSummary(userId);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':userId/delete')
  @ApiOperation({ summary: 'Create a new cost estimator' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(
    @Param('userId') userId: string,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    return this.deleteAccountService.deleteUserAccount(
      userId,
      deleteAccountDto,
    );
  }
}
