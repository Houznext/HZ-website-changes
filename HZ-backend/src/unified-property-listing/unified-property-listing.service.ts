import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyService } from 'src/property/property.service';
import { CompanyOnboardingService } from 'src/company-onboarding/company-onboarding.service';
import { PromotionTypeEnum } from 'src/company-onboarding/Enum/company.enum';
import { PopularBuilderDto } from 'src/company-onboarding/dto/project.filter.dto';

@Injectable()
export class UnifiedPropertyListingService {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly companyOnboardingService: CompanyOnboardingService,
  ) {}

   async getUnifiedListings(filters: any) {
   function normalizeParam<T = any>(value: T | T[]): T[] {
      if (Array.isArray(value)) return value;
      if (value === undefined || value === null) return [];
      return [value];
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const lookingType = normalizeParam(filters.lookingtype);
    const purpose = normalizeParam(filters.purpose);
    const city = normalizeParam(filters.city);
    const locality = normalizeParam(filters.locality);
    const localityId =
      typeof filters.localityId === 'string' && filters.localityId.trim()
        ? filters.localityId.trim()
        : undefined;
    const builderId =
      typeof filters.builderId === 'string' && filters.builderId.trim()
        ? filters.builderId.trim()
        : undefined;
    const propertytype = normalizeParam(filters.propertytype);
    const bhkType = normalizeParam(filters.bhkType);
    const facing = normalizeParam(filters.facing);
    const priceRange = normalizeParam(filters.priceRange);
    const buildupArea = normalizeParam(filters.buildupArea);
    const amenities = normalizeParam(filters.amenities);
    const constructionStatus = normalizeParam(filters.constructionStatus);
    const furnishingType=normalizeParam(filters.furnishingType);
    const ageOfProperty = normalizeParam(filters.ageOfProperty);
    const promotionType = normalizeParam(filters.promotionType);
    const genderPreference = normalizeParam(filters.genderPreference);
    const sharingType = normalizeParam(filters.sharingType);
    const saleType = normalizeParam(filters.saleType);
    const referAndEarnOnly =
      typeof filters.referAndEarnOnly === 'string'
        ? filters.referAndEarnOnly.toLowerCase() === 'true'
        : !!filters.referAndEarnOnly;

    const shouldIncludeProjects =
      !referAndEarnOnly &&
      (lookingType.length === 0 || lookingType.includes('Sell'));

    const isPlot = propertytype.includes('Plot');

    let individualPromise = Promise.resolve({
      data: [],
      total: 0,
      currentPage: page,
      totalPages: 0,
    });

    // When localityId is set, also pass locality name(s) so we show all properties in that area (same locality name, different location_details rows)
    const localitySlug =
      typeof filters.locality === 'string' && filters.locality.trim()
        ? decodeURIComponent(filters.locality).trim().replace(/-/g, ' ')
        : Array.isArray(filters.locality) && filters.locality[0]
          ? String(filters.locality[0]).replace(/-/g, ' ')
          : '';
    const localityNameForFallback =
      localityId && localitySlug ? [localitySlug.split(/\s+/)[0]] : [];
    const localityForProperty =
      localityId && localityNameForFallback.length > 0
        ? localityNameForFallback
        : localityId
          ? []
          : locality;
    const skipIndividualWhenBuilder =
      !!builderId;
    if (!skipIndividualWhenBuilder && !isPlot) {
      individualPromise = this.propertyService.getAllProperties(
        localityForProperty,
        city,
        filters.propertyname,
        propertytype,
        bhkType,
        lookingType,
        facing,
        purpose,
        priceRange,
        buildupArea,
        amenities,
        constructionStatus,
        furnishingType,
        ageOfProperty,
        page,
        limit,
        promotionType,
        genderPreference,
        sharingType,
        saleType,
        localityId,
        referAndEarnOnly,
      );
    } else if (!skipIndividualWhenBuilder && isPlot) {
      individualPromise = this.propertyService.getAllProperties(
        localityForProperty,
        city,
        filters.propertyname,
        propertytype,
        [], // bhkType skipped
        [], // lookingType skipped
        [], // facing skipped
        purpose, // purpose skipped
        priceRange,
        [], // buildupArea skipped
        amenities,
        constructionStatus,
        furnishingType,
        ageOfProperty,
        page,
        limit,
        promotionType,
        genderPreference,
        sharingType,
        saleType,
        localityId,
        referAndEarnOnly,
      );
    }

    let companyPromise = Promise.resolve({
      data: [],
      total: 0,
      currentPage: page,
      totalPages: 0,
    });

    if (shouldIncludeProjects && !isPlot) {
      const projectFilters = {
        city,
        locality: localityId ? undefined : locality,
        localityId,
        builderId,
        propertytype,
        priceRange,
        constructionStatus,
        amenities,
        ageOfProperty,
        promotionType,
        page,
        limit: 10,
      };

      companyPromise =
        this.companyOnboardingService.getAllProjects(projectFilters);
    }

    const [individual, company] = await Promise.all([
      individualPromise,
      companyPromise,
    ]);

    return {
      companyProjects: company.data,
      individualProperties: individual.data,
      pagination: {
        company: {
          total: company.total,
          currentPage: company.currentPage,
          totalPages: company.totalPages,
        },
        individual: {
          total: individual.total,
          currentPage: individual.currentPage,
          totalPages: individual.totalPages,
        },
      },
    };
  }

  async getSearchSuggestions(query: {
    search: string;
    city?: string;
    lookingType?: any[];
  }) {
    const search = query.search?.trim();
    const city = query.city?.trim();
    const lookingTypes: string[] = Array.isArray(query.lookingType)
      ? (query.lookingType as string[]).map((type) => type.toLowerCase())
      : query.lookingType
        ? [(query.lookingType as string).toLowerCase()]
        : [];

    if (!search || search.length < 2) {
      return {
        localities: [],
        properties: [],
        projects: [],
        builders: [],
      };
    }
    const normalizedLookingTypes = lookingTypes.map((lt) => lt.toLowerCase());

    const shouldFetchProjects =
      normalizedLookingTypes.length === 0 ||
      normalizedLookingTypes.includes('sell');

    const shouldFetchProperties =
      normalizedLookingTypes.length === 0 ||
      normalizedLookingTypes.includes('sell') ||
      normalizedLookingTypes.includes('rent');

    // Fetch by name and by location (all searchable fields); merge and dedupe. Order: localities → properties → projects → builders.
    const [
      localitiesRaw,
      propertiesByName,
      propertiesByLocality,
      projectsByName,
      projectsByLocality,
      buildersByName,
      buildersByLocality,
    ] = await Promise.all([
      this.propertyService.searchLocalities(
        search,
        city,
        normalizedLookingTypes,
      ),
      shouldFetchProperties
        ? this.propertyService.searchPropertiesByName(
            search,
            city,
            normalizedLookingTypes,
          )
        : Promise.resolve([]),
      shouldFetchProperties
        ? this.propertyService.searchPropertiesByLocality(
            search,
            city,
            normalizedLookingTypes,
          )
        : Promise.resolve([]),
      shouldFetchProjects
        ? this.companyOnboardingService.searchProjects(search, city)
        : Promise.resolve([]),
      shouldFetchProjects
        ? this.companyOnboardingService.searchProjectsByLocality(search, city)
        : Promise.resolve([]),
      this.companyOnboardingService.searchBuilders(search),
      this.companyOnboardingService.searchBuildersByLocality(search, city),
    ]);

    // Unique localities by label (same locality+city can appear from multiple location rows)
    const seenLabels = new Set<string>();
    const localities = localitiesRaw
      .map((loc) => ({
        label: `${loc.locality}, ${loc.city}`,
        id: loc.id,
      }))
      .filter((item) => {
        if (seenLabels.has(item.label)) return false;
        seenLabels.add(item.label);
        return true;
      });

    // Merge properties: by name + by location, dedupe by id, limit 10
    const propertiesById = new Map<string, any>();
    [...propertiesByName, ...propertiesByLocality].forEach((prop) => {
      if (!propertiesById.has(prop.propertyId)) {
        propertiesById.set(prop.propertyId, prop);
      }
    });
    const properties = Array.from(propertiesById.values()).slice(0, 10);

    // Merge projects: by name + by location, dedupe by id, limit 10
    const projectsById = new Map<string, any>();
    [...projectsByName, ...projectsByLocality].forEach((proj) => {
      if (!projectsById.has(proj.id)) {
        projectsById.set(proj.id, proj);
      }
    });
    const projects = Array.from(projectsById.values()).slice(0, 10);

    // Merge builders: by name + by location, dedupe by id, limit 10
    const buildersById = new Map<string, any>();
    [...buildersByName, ...buildersByLocality].forEach((company) => {
      if (!buildersById.has(company.id)) {
        buildersById.set(company.id, company);
      }
    });
    const builders = Array.from(buildersById.values()).slice(0, 10);

    return {
      localities,
      properties: properties.map((prop) => ({
        label: `${prop.propertyDetails?.propertyName}, ${prop.locationDetails?.city ?? 'Unknown'}`,
        id: prop.propertyId,
        type: 'property',
      })),
      projects: projects.map((proj) => ({
        label: `${proj.Name}, ${proj.location?.city ?? 'Unknown'}`,
        id: proj.id,
      })),
      builders: builders.map((company) => ({
        label: company.companyName,
        id: company.id,
      })),
    };
  }

  async resolveSlug(slug: string, city: string, category: string) {
    const project = await this.companyOnboardingService.findProjectBySlug(
      slug,
      city,
    );
    if (project) {
      return {
        id: project.id,
        type: 'project',
        details: project,
      };
    }

    const property = await this.propertyService.findPropertyBySlug(slug, city);
    if (property) {
      return {
        id: property.propertyId,
        type: 'property',
        details: property,
      };
    }

    throw new NotFoundException(
      'No matching project or property found for given slug.',
    );
  }

  // all functions related to summary api

  private async getTopProperties(city: string): Promise<any[]> {
    const page = 1;
    const limit = 4;
    const promotionType = ['Featured'];
    const result = await this.propertyService.getAllProperties(
      [], // locality
      [city], // city
      undefined, // propertyname
      [], // propertytype
      [], // bhkType
      [], // lookingType
      [], // facing
      [], // purpose
      [], // priceRange
      [], // buildupArea
      [], // amenities
      [], // constructionStatus
      [], // ageOfProperty
      [],
      page,
      limit,
      promotionType,
    );
    return (
      result?.data.map((item) => ({
        id: item.propertyId,
        name: item?.propertyDetails?.propertyName,
        type: item?.propertyDetails?.propertyType,
        city: item?.locationDetails?.city,
        location: item?.locationDetails?.locality,
        area: `${item?.propertyDetails?.residentialAttributes?.buildupArea?.size} ${item.propertyDetails?.residentialAttributes?.buildupArea?.unit}`,

        price:
          (item.basicDetails?.lookingType === 'Rent'||item.basicDetails?.lookingType==='Flat Share')
            ? item?.propertyDetails?.pricingDetails?.monthlyRent
            : item.propertyDetails?.pricingDetails?.pricePerSqft,
        images: item.mediaDetails?.propertyImages[0] || null,
      })) || []
    );
  }

  private async getTopProjects(city: string): Promise<any[]> {
    const filters = {
      city: [city],
      promotionType: [PromotionTypeEnum.Premium],
      page: 1,
      limit: 4,
    };

    const result = await this.companyOnboardingService.getAllProjects(filters);

    return result.data.map((project) => ({
      id: project.id,
      name: project.name,
      locality: project.location?.locality || 'Unknown',
      city: project.location?.city || 'Unknown',
      priceRange: `₹ ${project.minPrice} - ₹ ${project.maxPrice}`,
      areaRange:
        project.minSize?.size && project.maxSize?.size
          ? `${project.minSize.size}  ${project.minSize.unit} - ${project.maxSize.size} ${project.maxSize.unit}`
          : 'N/A',
      images: project.mediaDetails?.propertyImages || [],
      badge: project.promotionType?.includes('premium')
        ? 'Premium'
        : project.promotionType?.[0] || null,
    }));
  }

  private async getPopularLocalities(city: string): Promise<any> {
    return this.companyOnboardingService.getPopularLocalities(city);
  }

  private async getPopularBuilders(city: string): Promise<PopularBuilderDto[]> {
    return this.companyOnboardingService.getPopularBuilders(city);
  }
  async getCityWiseTotalPropertyCounts(): Promise<
    { city: string; total: number }[]
  > {
    const [propertyCounts, projectCounts] = await Promise.all([
      this.propertyService.getCityWisePropertyCounts(),
      this.companyOnboardingService.getCityWiseProjectCounts(),
    ]);

    const cityMap = new Map<string, number>();
    for (const row of propertyCounts) {
      const city = row.city.trim().toLowerCase();
      const count = parseInt(row.count, 10);
      cityMap.set(city, count);
    }
    for (const row of projectCounts) {
      const city = row.city.trim().toLowerCase();
      const count = parseInt(row.count, 10);
      cityMap.set(city, (cityMap.get(city) || 0) + count);
    }

    return Array.from(cityMap.entries()).map(([city, total]) => ({
      city: city.charAt(0).toUpperCase() + city.slice(1),
      total,
    }));
  }

  async getSummary(city: string): Promise<any> {
    const [
      topProperties,
      topProjects,
      popularLocalities,
      popularBuilders,
      cityPropertyCounts,
    ] = await Promise.all([
      this.getTopProperties(city),
      this.getTopProjects(city),
      this.getPopularLocalities(city),
      this.getPopularBuilders(city),
      this.getCityWiseTotalPropertyCounts(),
    ]);

    return {
      city,
      topProperties,
      topProjects,
      popularLocalities,
      popularBuilders,
      popularCities: cityPropertyCounts,
    };
  }
}
