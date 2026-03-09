import { Controller, Get, Query , UseGuards} from '@nestjs/common';
import { UnifiedPropertyListingService } from './unified-property-listing.service';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PurposeType, lookingType } from 'src/property/enums/property.enum';

@Controller('unified-listings')
@ApiTags('Unified Property Listings')
export class UnifiedPropertyListingController {
  constructor(
    private readonly unifiedPropertyListingService: UnifiedPropertyListingService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get unified property listings',
    description:
      'Fetches both company-posted projects and individual/broker properties in one response.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successful response including both company projects and individual properties.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'city', required: false, type: [String] })
  @ApiQuery({ name: 'locality', required: false, type: [String] })
  @ApiQuery({ name: 'localityId', required: false, type: String, description: 'LocationDetails UUID from search suggestion' })
  @ApiQuery({ name: 'builderId', required: false, type: String, description: 'Company/builder UUID from search suggestion' })
  @ApiQuery({ name: 'propertytype', required: false, type: [String] })
  @ApiQuery({ name: 'bhkType', required: false, type: [String] })
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
  @ApiQuery({ name: 'priceRange', required: false, type: [String] })
  @ApiQuery({ name: 'buildupArea', required: false, type: [String] })
  @ApiQuery({ name: 'amenities', required: false, type: [String] })
  @ApiQuery({ name: 'constructionStatus', required: false, type: [String] })
  @ApiQuery({ name: 'promotionType', required: false, type: [String] })
  @ApiQuery({ name: 'ageOfProperty', required: false, type: [String] })
  @ApiQuery({
    name: 'referAndEarnOnly',
    required: false,
    type: Boolean,
    description:
      'If true, only properties with Refer & Earn enabled are returned (projects are excluded).',
  })
  @ApiQuery({name:'furnishingType',required:false,type:[String]})
  @ApiQuery({name:'saleType',required:false,type:[String]})
  async getUnifiedListings(@Query() query: any) {
    return this.unifiedPropertyListingService.getUnifiedListings(query);
  }

  @Get('/search-suggestions')
  @ApiOperation({
    summary: 'Get search suggestions for property listings',
    description:
      'Returns suggestions matching the search across all searchable fields. Localities: locality, city, subLocality, area, landmark, zone, street. Properties: name + location fields. Projects: name + location fields. Builders: company name + have projects in matching location. Order: localities → properties → projects → builders. Results are merged (by name and by location) and deduped.',
  })
  @ApiResponse({
    status: 200,
    description: 'Localities (unique), properties, projects, and builders matching the search by name or location.',
    schema: {
      example: {
        localities: [{ label: 'Madhapur, Hyderabad', id: 'uuid' }],
        properties: [{ label: 'SkyView Residency, Hyderabad', id: 'uuid', type: 'property' }],
        projects: [{ label: 'Example Project, Hyderabad', id: 'uuid' }],
        builders: [{ label: 'Dream Casa Realestates', id: 'uuid' }],
      },
    },
  })
  @ApiQuery({
    name: 'search',
    required: true,
    type: String,
    description: 'Search text – matches names and all location fields (locality, city, subLocality, area, landmark, zone, street)',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Optional city to filter the suggestions',
  })
  @ApiQuery({
    name: 'lookingtype',
    required: false,
    enum: lookingType,
    isArray: true,
    description:
      'Looking type filter for search suggestions (e.g., Buy or Rent)',
  })
  async getSearchSuggestions(@Query() query: any) {
    return this.unifiedPropertyListingService.getSearchSuggestions(query);
  }

  @Get('/resolve-slug')
  @ApiOperation({
    summary: 'Resolve slug to a property or project',
    description:
      'Used to route slug URLs like /buy/hyderabad/sri-balaji-residency to the correct property or project ID',
  })
  @ApiQuery({ name: 'slug', required: true, type: String })
  @ApiQuery({ name: 'city', required: true, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Resolved property/project with ID and type',
    schema: {
      example: {
        id: 123,
        type: 'property',
      },
    },
  })
  async resolveSlug(
    @Query('slug') slug: string,
    @Query('city') city: string,
    @Query('category') category: string,
  ) {
    return this.unifiedPropertyListingService.resolveSlug(slug, city, category);
  }

  @Get('/summary')
  @ApiOperation({
    summary: 'Get summary of unified property listings',
    description:
      'Returns a summary of unified property listings, including total properties, projects, and builders.',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary of unified property listings.',
  })
  async getSummary(@Query('city') city: string): Promise<any> {
    return this.unifiedPropertyListingService.getSummary(city);
  }
}
