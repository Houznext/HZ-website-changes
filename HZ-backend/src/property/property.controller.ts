import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,ParseIntPipe
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { LocationDetails } from './entities/location.entity';
import { MediaDetails } from './entities/mediaDetails.entity';
import { Property } from './entities/property.entity';
import {
  CreatePropertyDto,
  PromotionUpdateDto,
  PropertyDetailsDto,
  CreateBasicDetailsPayloadDto,UpdateLocationDetailsDto,UpdateMediaDetailsDto
} from './dto/property.dto';
import { normalizeQueryParam } from './utils/normalizeQueryParam';
import { ControllerAuthGuard } from 'src/guard';
import {
  BHKType,
  ConstructionStatus,
  facingType,
  lookingType,
  PurposeType,
} from './enums/property.enum';
import { PromotionTypeEnum } from 'src/company-onboarding/Enum/company.enum';

@Controller('property')
@ApiTags('Properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post('/basic-details')
  @ApiOperation({
    summary: 'Create Basic Details',
    description: 'Creates the basic details for a property.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        postedByUser: { type: 'number', example: 1 },
        basicDetails: {
          type: 'object',
          example: {
            title: 'Beautiful Apartment',
            description: '2 BHK in downtown',
          },
        },
      },
    },
  })
  async createBasicDetails(@Body() body: CreateBasicDetailsPayloadDto) {
    const { postedByUserId, basicDetails } = body;
    return this.propertyService.createBasicDetails(
      postedByUserId,
      basicDetails,
    );
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch('/basic-details/:id')
  @ApiOperation({
    summary: 'Update Basic Details',
    description: 'Updates the Basic details of a property.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Property ID',
    example: 123,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        basicDetails: {
          type: 'object',
          example: {
            title: 'Beautiful Apartment',
            description: '2 BHK in downtown',
          },
        },
      },
    },
  })
  // async updateBasicDetails(
  //   @Param('id') propertyId: string, // Extract property ID from URL
  //   @Body() basicDetails: BasicDetails, // Extract payload
  //    @Body('postedByUserId') postedByUserId?: number,
  // ): Promise<Property> {
  //   return await this.propertyService.updateBasicDetails(
  //     propertyId,
  //     basicDetails,
  //      postedByUserId,
  //   );
  // }
  async updateBasicDetails(
    @Param('id') propertyId: string,
    @Body() body: CreateBasicDetailsPayloadDto,
  ) {
    const { postedByUserId, basicDetails } = body;
    return this.propertyService.updateBasicDetails(
      propertyId,
      basicDetails,
      postedByUserId,
    );
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch('/location-details/:id')
  @ApiOperation({
    summary: 'Update Location Details',
    description: 'Updates the location details of a property.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Property ID',
    example: 123,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        locationDetails: {
          type: 'object',
          example: {
            city: 'New York',
            state: 'NY',
            country: 'USA',
          },
        },
      },
    },
  })
 async updateLocationDetails(
  @Param('id') id: string,
  @Body() body: UpdateLocationDetailsDto,
) {
  return this.propertyService.updateLocationDetails(id, body.locationDetails);
}

  // @UseGuards(ControllerAuthGuard)
  @Patch('/property-details/:id')
  @ApiOperation({
    summary: 'Update Property Details',
    description: 'Updates the detailed information of a property.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Property ID',
    example: 123,
  })
  @ApiBody({ type: PropertyDetailsDto })
  async updatePropertyDetails(
    @Param('id') id: string,
    @Body() createPropertyDto: PropertyDetailsDto,
  ): Promise<Property> {
    return await this.propertyService.updatePropertyDetails(
      id,
      createPropertyDto,
    );
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch('/media-details/:id')
  @ApiOperation({
    summary: 'Update Media Details',
    description: 'Updates the media details of a property.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Property ID',
    example: 123,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mediaDetails: {
          type: 'object',
          example: {
            images: ['image1.jpg', 'image2.jpg'],
            videos: ['video1.mp4'],
          },
        },
      },
    },
  })
  async updateMediaDetails(
  @Param('id') id: string,
  @Body() body: UpdateMediaDetailsDto,
) {
  return await this.propertyService.updateMediaDetails(id, body.mediaDetails);
}
  // @UseGuards(ControllerAuthGuard)
  @Patch('/:id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: CreatePropertyDto,
  ): Promise<Property> {
    return await this.propertyService.updateProperty(id, updatePropertyDto);
  }

  // @UseGuards(ControllerAuthGuard)
  @Get('/get-all-properties/:user_id')
  @ApiOperation({ summary: 'Get all properties of a user' })
  @ApiParam({
    name: 'user_id',
    type: 'number',
    description: 'User ID',
    example: 123,
  })
  async getAllPropertiesOfUser(@Param('user_id') userId: string) {
    return this.propertyService.getAllPropertiesOfUser(userId);
  }

  @Get('/get-all-properties')
  @ApiOperation({ summary: 'Get All Properties' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'locality', required: false, type: [String] })
  @ApiQuery({ name: 'city', required: false, type: [String] })
  @ApiQuery({ name: 'propertyname', required: false, type: String })
  @ApiQuery({ name: 'propertytype', required: false, type: [String] })
  @ApiQuery({ name: 'bhkType', required: false, enum: BHKType, isArray: true })
  @ApiQuery({
    name: 'lookingtype',
    required: false,
    enum: lookingType,
    isArray: true,
  })
  @ApiQuery({
    name: 'purpose',
    required: false,
    enum: PurposeType,
    isArray: true,
  })
  @ApiQuery({
    name: 'facing',
    required: false,
    enum: facingType,
    isArray: true,
  })
  @ApiQuery({ name: 'priceRange', required: false, type: [String] })
  @ApiQuery({ name: 'buildupArea', required: false, type: [String] })
  @ApiQuery({ name: 'amenities', required: false, type: [String] })
  @ApiQuery({
    name: 'constructionStatus',
    required: false,
    enum: ConstructionStatus,
    isArray: true,
  })
  @ApiQuery({
    name: 'promotionType',
    required: false,
    enum: PromotionTypeEnum,
    isArray: true,
    description: 'Filter by multiple promotion types',
  })
  @ApiQuery({ name: 'ageOfProperty', required: false, type: [String] })
  async getAllProperties(
    @Query('page') page: number = 1,
    @Query('limit') limit?: number,
    @Query('locality') locality?: string | string[],
    @Query('city') city?: string | string[],
    @Query('propertyname') propertyname?: string,
    @Query('propertytype') propertytype?: string | string[],
    @Query('bhkType') bhkType?: BHKType[],
    @Query('lookingtype') lookingtype?: lookingType[],
    @Query('purpose') purpose?: PurposeType[],
    @Query('facing') facing?: facingType[],
    @Query('priceRange') priceRange?: string | string[],
    @Query('buildupArea') buildupArea?: string | string[],
    @Query('amenities') amenities?: string | string[],
    @Query('furnishingType') furnishingType?: string | string[],
    @Query('constructionStatus') constructionStatus?: ConstructionStatus[],
    @Query('ageOfProperty') ageOfProperty?: string | string[],
    @Query('promotionType') promotionType?: PromotionTypeEnum[],
  ) {
    // Normalize query parameters to always be arrays where applicable
    const localityArray = normalizeQueryParam(locality);
    const cityArray = normalizeQueryParam(city);
    const propertyName =
      propertyname && propertyname !== '' ? propertyname : undefined;
    const propertytypeArray = normalizeQueryParam(propertytype);
    const bhkTypeArray = normalizeQueryParam(bhkType);
    const lookingtypeArray = normalizeQueryParam(lookingtype);
    const purposeArray = normalizeQueryParam(purpose);
    const facingArray = normalizeQueryParam(facing);
    const priceRangeArray = normalizeQueryParam(priceRange);
    const buildupAreaArray = normalizeQueryParam(buildupArea);
    const amenitiesArray = normalizeQueryParam(amenities);
    const constructionStatusArray = normalizeQueryParam(constructionStatus);
    const ageOfPropertyArray = normalizeQueryParam(ageOfProperty);
    const promotionTypes = normalizeQueryParam(promotionType);
    const furnishingTypes = normalizeQueryParam(furnishingType);

    // Call the service method with normalized parameters
    return this.propertyService.getAllProperties(
      localityArray,
      cityArray,
      propertyName,
      propertytypeArray,
      bhkTypeArray,
      lookingtypeArray,
      facingArray,
      purposeArray,
      priceRangeArray,
      buildupAreaArray,
      amenitiesArray,
      constructionStatusArray,
      ageOfPropertyArray,
      furnishingTypes,
      page,
      limit,
      promotionTypes,
    );
  }

  @Get('/get-city-projects')
  @ApiOperation({ summary: 'Get Recent Projects by City' })
  @ApiQuery({ name: 'city', required: true, type: String })
  async getCityProjects(@Query('city') cityName: string) {
    return this.propertyService.getCityProjects(cityName);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get Property by ID',
    description: 'Fetches a property by its ID.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Property ID',
    example: 123,
  })
  async getPropertyById(@Param('id') id: string): Promise<any> {
    return this.propertyService.getPropertyById(id);
  }

  @Get('/get-pending-properties/:user_id')
  @ApiOperation({
    summary: 'Get all pending properties of a user',
    description: 'Fetches a pending properties by user ID.',
  })
  @ApiParam({
    name: 'user_id',
    type: 'number',
    description: 'User ID',
    example: 123,
  })
  async getPendingProperties(
    @Param('user_id') userId: string,
  ): Promise<Property> {
    return await this.propertyService.getPendingProperty(userId);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete Property',
    description: 'Deletes a property by its ID.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Property ID',
    example: 123,
  })
  async deleteProperty(@Param('id') id: string) {
    return this.propertyService.deleteProperty(id);
  }

  /*******************************************ADMIN CONTROLLERS*************************************/
  @UseGuards(ControllerAuthGuard)
  //property/admin - POST (add property)
  @Post('/admin')
  @ApiOperation({
    summary: 'Add Property',
    description: 'Adds a new property.',
  })
  async adminAddProperty(
    @Body('adminUserId') adminUserId: string,
    @Body() createPropertyDto: CreatePropertyDto,
  ): Promise<Property> {
    return await this.propertyService.adminAddProperty(
      adminUserId,
      createPropertyDto,
    );
  }

  //property/admin/:id - PUT (update property)
  @UseGuards(ControllerAuthGuard)
  @Patch('/admin/:id')
  @ApiOperation({
    summary: 'Update Property',
    description: 'Updates a property by its ID.',
  })
  async adminUpdateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: CreatePropertyDto,
  ): Promise<Property> {
    return await this.propertyService.adminUpdateProperty(
      id,
      updatePropertyDto,
    );
  }
  //property/admin/:id - DELETE (delete property)
  @UseGuards(ControllerAuthGuard)
  @Delete('/admin/:id')
  @ApiOperation({
    summary: 'Delete Property',
    description: 'Deletes a property by its ID.',
  })
  async adminDeleteProperty(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return await this.propertyService.adminDeleteProperty(id);
  }

  //property/admin/counts - GET (returns status counts for admin dashboard)
  @Get('/admin/counts')
  @ApiOperation({
    summary: 'Get Property Status Counts',
    description: 'Returns counts of properties by status (all, pending, approved, draft) for admin dashboard.',
  })
  async getPropertyStatusCounts(): Promise<{
    all: number;
    pending: number;
    approved: number;
    draft: number;
  }> {
    return await this.propertyService.getPropertyStatusCounts();
  }

  //property/admin/all - GET (returns all properties for admin with filters)
  @Get('/admin/all')
  @ApiOperation({
    summary: 'Get All Properties for Admin',
    description: 'Fetches all properties with optional status filters for admin review.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'approved', 'posted', 'draft'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllPropertiesForAdmin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status: 'all' | 'pending' | 'approved' | 'posted' | 'draft' = 'all',
    @Query('search') search?: string,
  ): Promise<{
    data: Property[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    return await this.propertyService.adminGetAllPropertiesWithFilters(page, limit, status, search);
  }

  //property/admin/:id - GET (Specific property)
  @Get('/admin/:id')
  @ApiOperation({
    summary: 'Get Specific Property',
    description: 'Fetches a specific property by its ID.',
  })
  async getSpecificProperty(@Param('id') id: string): Promise<Property> {
    return await this.propertyService.getSpecificProperty(id);
  }

  //property/admin/:id - patch (update property)
  @UseGuards(ControllerAuthGuard)
  @Patch('/admin/:id/promotion')
  @ApiOperation({
    summary: 'Update promotion details for a property',
    description:
      'Allows admin to set promotion type, expiry, and record who approved and updated the property.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Property ID',
  })
  @ApiBody({ type: PromotionUpdateDto })
  async updatePromotionType(
    @Param('id') id: string,
    @Body() body: PromotionUpdateDto,
  ): Promise<Property> {
    return await this.propertyService.updatePromotionType(
      id,
      body.promotionType,
      body.promotionExpiry,
      body.approvedBy,
      body.updatedBy,
      body.promotionTags,
    );
  }

  // Approve or reject a property
  @UseGuards(ControllerAuthGuard)
  @Patch('/admin/:id/approve')
  @ApiOperation({
    summary: 'Approve or reject a property',
    description: 'Allows admin to approve or reject a property listing.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Property ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isApproved: { type: 'boolean', example: true },
        isPosted: { type: 'boolean', example: true },
        approvedBy: { type: 'string', example: 'admin-user-id' },
        rejectionReason: { type: 'string', example: 'Incomplete details' },
      },
    },
  })
  async approveProperty(
    @Param('id') id: string,
    @Body() body: {
      isApproved: boolean;
      isPosted?: boolean;
      approvedBy: string;
      rejectionReason?: string;
    },
  ): Promise<Property> {
    return await this.propertyService.approveProperty(
      id,
      body.isApproved,
      body.approvedBy,
      body.isPosted,
      body.rejectionReason,
    );
  }
}
