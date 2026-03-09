import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  GetAllBlogDto,
  GetByIdBlogDto,
  deleteBlog,
  blogGetAllDto,
  blogGetByIdDto,
} from './dto/blog.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Blog } from './entities/blog.entity';
import { ControllerAuthGuard } from 'src/guard';

@Controller('blog')
@ApiTags('Blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiResponse({
    status: 201,
    description: 'The blog has been successfully created.',
    type: CreateBlogDto,
  })
  async createBlog(@Body() createBlogDto: CreateBlogDto): Promise<Blog> {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({
    status: 200,
    description: 'List of blogs.',
    type: [blogGetAllDto],
  })
  async getAllBlogs(@Query() query: GetAllBlogDto): Promise<{ blogs: Blog[]; total: number }> {
    return this.blogService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog by ID' })
  @ApiResponse({
    status: 200,
    description: 'Details of the blog.',
    type: blogGetByIdDto,
  })
  async getBlogById(
    @Param('id') id: string,
    @Query() query: GetByIdBlogDto,
  ): Promise<Blog> {
    return this.blogService.findOne(id, query);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog' })
  @ApiResponse({
    status: 200,
    description: 'The blog has been successfully updated.',
    type: UpdateBlogDto,
  })
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<Blog> {
    return this.blogService.update(id, updateBlogDto);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog' })
  @ApiResponse({
    status: 200,
    description: 'The blog has been successfully deleted.',
  })
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogService.remove(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('seed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed 25 realistic blog posts' })
  @ApiResponse({ status: 201, description: 'Blogs seeded successfully.' })
  async seedBlogs(): Promise<{ created: number; failed: number }> {
    return this.blogService.seedBlogs();
  }
}
