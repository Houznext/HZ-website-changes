import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ReviewService } from './reviews.service';
import { CreateReviewDto } from './dtos/reviews.dto';
import { ControllerAuthGuard } from 'src/guard';

type RequestUser = { id: string; roles?: any[] };

@Controller('reviews')
@ApiTags('Reviews')
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ---------- POST REVIEW (USER) ----------
  @UseGuards(ControllerAuthGuard)
  @Post('/:type/:id')
  @ApiOperation({
    summary: 'Post a review for a specific entity by type and ID',
  })
  async postReview(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.reviewService.postReview(
      req.user.id,
      type,
      id,
      createReviewDto,
    );
  }

  // ---------- GET REVIEWS (PUBLIC) ----------
  @Get('/:type/:id')
  @ApiOperation({
    summary: 'Get all reviews for a specific entity by type and ID',
  })
  async getAllReviews(@Param('type') type: string, @Param('id') id: string) {
    return this.reviewService.getAllReviews(type, id);
  }

  // ---------- DELETE REVIEW (USER) ----------
  @UseGuards(ControllerAuthGuard)
  @Delete('/:reviewId')
  @ApiOperation({ summary: 'User deleting own review' })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.reviewService.deleteReview(req.user.id, reviewId);
  }

  // ---------- DELETE REVIEW (ADMIN) ----------
  @UseGuards(ControllerAuthGuard)
  @Delete('/admin/:reviewId')
  @ApiOperation({ summary: 'Admin deleting any review' })
  async adminDeleteReview(@Param('reviewId') reviewId: string) {
    return this.reviewService.adminDeleteReview(reviewId);
  }
}
