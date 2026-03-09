import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, SelectQueryBuilder } from 'typeorm';
import { PropertyDetails } from './entities/propertyDetails.entity';
import { Furnishing } from './entities/property-details/furnishing.entity';
import { PricingDetails } from './entities/property-details/pricingDetails.entity';
import { ResidentialAttributes } from './entities/property-details/residential.entity';
import { ConstructionStatus } from './entities/property-details/constructionStatus.entity';
import { PlotAttributes } from './entities/property-details/plot.entity';
import { OccupancyDetails } from './entities/property-details/occupancy.entity';
import { Property } from './entities/property.entity';
import { BasicDetails } from './entities/basicDetails.entity';
import { LocationDetails } from './entities/location.entity';
import { MediaDetails } from './entities/mediaDetails.entity';
import { User } from 'src/user/entities/user.entity';
import {
  CreatePropertyDto,
  PropertyDetailsDto,
  BasicDetailsDto,
  LocationDetailsDto,
  MediaDetailsDto,
} from './dto/property.dto';
import { CommercialAttribute } from './entities/property-details/commercialAttributes.entity';
import { Facilities } from './entities/property-details/facilities.entity';
import { plainToInstance } from 'class-transformer';
import { MailerService } from 'src/sendEmail.service';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';
import { FlatshareAttributes } from './entities/property-details/flatshareDetails.entity';
import { S3Service } from 'src/common/s3/s3.service';
import { PromotionTypeEnum } from 'src/company-onboarding/Enum/company.enum';
import { NotificationService } from 'src/notifications/notification.service';
import { generatePropertyUpdateTemplate } from 'src/emailTemplates';
import { PurposeType, lookingType } from '../property/enums/property.enum';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(ResidentialAttributes)
    private readonly residentialAttributesRepository: Repository<ResidentialAttributes>,
    @InjectRepository(PricingDetails)
    private readonly pricingDetailsRepository: Repository<PricingDetails>,
    @InjectRepository(Furnishing)
    private readonly furnishingRepository: Repository<Furnishing>,
    @InjectRepository(ConstructionStatus)
    private readonly constructionStatusRepository: Repository<ConstructionStatus>,
    @InjectRepository(PlotAttributes)
    private readonly plotAttributesRepository: Repository<PlotAttributes>,
    @InjectRepository(OccupancyDetails)
    private readonly occupancyDetailsRepository: Repository<OccupancyDetails>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(BasicDetails)
    private readonly basicDetailsRepository: Repository<BasicDetails>,
    @InjectRepository(LocationDetails)
    private readonly locationDetailsRepository: Repository<LocationDetails>,
    @InjectRepository(MediaDetails)
    private readonly mediaDetailsRepository: Repository<MediaDetails>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CommercialAttribute)
    private readonly commercialAttributeRepository: Repository<CommercialAttribute>,
    @InjectRepository(Facilities)
    private readonly facilitiesRepository: Repository<Facilities>,

    @InjectRepository(FlatshareAttributes)
    private readonly flatshareRepo: Repository<FlatshareAttributes>,

    private readonly s3Service: S3Service,

    private readonly mailerService: MailerService,
    private readonly notificationService: NotificationService,
  ) {}

  //Create Basic Details
  async createBasicDetails(
    postedByUserId: string,
    basicDetails: BasicDetailsDto,
  ): Promise<Property> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: postedByUserId },
        relations: ['properties'],
      }); // Ensure user exists

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const postedPropertyCount = await this.propertyRepository.count({
        where: {
          postedByUser: { id: postedByUserId },
          isPosted: true,
        },
      });
      const isBypassed = user.role === 'ADMIN';

      if (!isBypassed && postedPropertyCount >= 5) {
        throw new BadRequestException(
          'You can only post up to 5 properties. Please delete or update existing ones.',
        );
      }

      // Check if any of the user's properties have isPosted set to false
      const pendingProperty = user.properties.find(
        (property) => property.isPosted === false,
      );

      if (pendingProperty) {
        throw new ConflictException(
          'There is a pending property. Please update or delete it before posting a new one.',
        );
      }

      const newBasicDetails =
        await this.basicDetailsRepository.save(basicDetails);
      const property = this.propertyRepository.create({
        postedByUser: user,
        currentStep: 1,
        basicDetails: newBasicDetails,
      });
      await this.propertyRepository.save(property);

      return await this.propertyRepository.findOne({
        where: { propertyId: property.propertyId },
        relations: [
          'basicDetails',
          'locationDetails',
          'propertyDetails',
          'propertyDetails.residentialAttributes',
          'propertyDetails.plotAttributes',
          'propertyDetails.pricingDetails',
          'propertyDetails.occupancyDetails',
          'propertyDetails.furnishing',
          'propertyDetails.constructionStatus',
          'propertyDetails.flatshareAttributes',
          'propertyDetails.commercialAttributes',
          'propertyDetails.facilities',
          'mediaDetails',
        ],
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Handle database query errors
        throw new BadRequestException(
          `Failed to create basic details: ${error.message}`,
        );
      }
      // Rethrow other errors
      throw error;
    }
  }

  async updateBasicDetails(
    propertyId: string,
    basicDetails: BasicDetailsDto,
    postedByUserId?: string,
  ): Promise<Property> {
    const property = await this.getPropertyById(propertyId);

    if (!property.basicDetails) {
      throw new NotFoundException('Basic details not found for this property');
    }

    // Update only the provided fields
    const updatedBasicDetails = this.basicDetailsRepository.merge(
      property.basicDetails,
      basicDetails, // Merge updates into the existing basicDetails
    );

    // Save updated basicDetails
    await this.basicDetailsRepository.save(updatedBasicDetails);

    return await this.propertyRepository.save(property);
  }

  //update location details
  async updateLocationDetails(
    propertyId: string,
    locationDetails: LocationDetailsDto,
  ): Promise<Property> {
    const property = await this.getPropertyById(propertyId);

    if (property.currentStep < 1) {
      throw new Error('Complete basic details first.');
    }

    let updatedLocationDetails: LocationDetails;

    if (property.locationDetails) {
      // Merge existing location details with new updates
      updatedLocationDetails = this.locationDetailsRepository.merge(
        property.locationDetails,
        locationDetails,
      );
    } else {
      // Create new location details if none exist
      updatedLocationDetails =
        this.locationDetailsRepository.create(locationDetails);
    }

    // Save the updated or new location details
    const savedLocationDetails = await this.locationDetailsRepository.save(
      updatedLocationDetails,
    );

    // Associate the saved location details with the property
    property.locationDetails = savedLocationDetails;

    // Update the current step to ensure progress tracking
    property.currentStep = Math.max(property.currentStep, 2);

    // Save the property with the updated location details
    await this.propertyRepository.save(property);

    return await this.propertyRepository.findOne({
      where: { propertyId: propertyId },
      relations: [
        'basicDetails',
        'locationDetails',
        'propertyDetails',
        'propertyDetails.residentialAttributes',
        'propertyDetails.plotAttributes',
        'propertyDetails.pricingDetails',
        'propertyDetails.occupancyDetails',
        'propertyDetails.flatshareAttributes',
        'propertyDetails.furnishing',
        'propertyDetails.constructionStatus',
        'propertyDetails.commercialAttributes',
        'propertyDetails.facilities',
        'mediaDetails',
      ],
    });
  }

  //update Property details
  async updatePropertyDetails(
    propertyId: string,
    createPropertyDto: PropertyDetailsDto,
  ): Promise<Property> {
    // Step 1: Fetch Property by ID
    const property = await this.getPropertyById(propertyId);

    // Ensure that the previous step (Location Details) is completed
    if (property.currentStep < 2) {
      throw new Error('Complete location details first.');
    }

    // Step 2: Use the existing `createPropertyWithRelations` method
    const propertyDetails =
      await this.createPropertyWithRelations(createPropertyDto);

    // Step 3: Link the updated PropertyDetails to the Property
    property.propertyDetails = propertyDetails;
    property.currentStep = Math.max(property.currentStep, 3);

    // Step 4: Save and return the updated Property
    await this.propertyRepository.save(property);

    return await this.propertyRepository.findOne({
      where: { propertyId: propertyId },
      relations: [
        'basicDetails',
        'locationDetails',
        'propertyDetails',
        'propertyDetails.residentialAttributes',
        'propertyDetails.plotAttributes',
        'propertyDetails.pricingDetails',
        'propertyDetails.occupancyDetails',
        'propertyDetails.flatshareAttributes',
        'propertyDetails.furnishing',
        'propertyDetails.constructionStatus',
        'propertyDetails.commercialAttributes',
        'propertyDetails.facilities',
        'mediaDetails',
      ],
    });
  }

  //update media details
  async updateMediaDetails(
    propertyId: string,
    mediaDetails: MediaDetailsDto,
  ): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { propertyId },
      relations: [
        'postedByUser',
        'basicDetails',
        'locationDetails',
        'propertyDetails',
        'propertyDetails.residentialAttributes',
        'propertyDetails.plotAttributes',
        'propertyDetails.pricingDetails',
        'propertyDetails.occupancyDetails',
        'propertyDetails.furnishing',
        'propertyDetails.constructionStatus',
        'propertyDetails.flatshareAttributes',
        'propertyDetails.commercialAttributes',
        'propertyDetails.facilities',
        'mediaDetails',
      ],
    });
    if (property.currentStep < 3) {
      throw new Error('Complete property details first.');
    }

    // Delete from S3 only URLs that are being removed (not in new list)
    if (property.mediaDetails) {
      const newImages = mediaDetails.propertyImages ?? [];
      const newVideos = mediaDetails.propertyVideo ?? [];
      const oldImages = property.mediaDetails.propertyImages ?? [];
      const oldVideos = property.mediaDetails.propertyVideo ?? [];
      const toDelete = [
        ...oldImages.filter((u: string) => !newImages.includes(u)),
        ...oldVideos.filter((u: string) => !newVideos.includes(u)),
      ].filter(Boolean);
      for (const url of toDelete) {
        try {
          await this.s3Service.deleteFileByUrl(url);
        } catch (err) {
          console.warn('Failed to delete property media from S3:', err);
        }
      }
    }

    const newMediaDetails =
      await this.mediaDetailsRepository.save(mediaDetails);
    property.mediaDetails = newMediaDetails;
    property.currentStep = Math.max(property.currentStep, 4);

    if (property.isReadyToPost()) {
      property.isPosted = true;
      property.postedDate = new Date();
    }

    /**trigger an
     * email and notification to respective admins and (users) to their admin mails
     * (as in propertylisting admin and furnitureadmin,InteriorsAdmin...for remaining all admins) */
    // Send confirmation email to the user
    await this.mailerService.sendUserConfirmationEmail(
      property,
      property.postedByUser,
    );
    await this.mailerService.notifyAdmins(property);

    await this.propertyRepository.save(property);

    return await this.propertyRepository.findOne({
      where: { propertyId: propertyId },
      relations: [
        'basicDetails',
        'locationDetails',
        'propertyDetails',
        'propertyDetails.residentialAttributes',
        'propertyDetails.plotAttributes',
        'propertyDetails.pricingDetails',
        'propertyDetails.occupancyDetails',
        'propertyDetails.furnishing',
        'propertyDetails.flatshareAttributes',
        'propertyDetails.constructionStatus',
        'propertyDetails.commercialAttributes',
        'propertyDetails.facilities',
        'mediaDetails',
      ],
    });
  }

  // Create or update PropertyDetails with relations
  async createPropertyWithRelations(
    createPropertyDto: PropertyDetailsDto,
  ): Promise<PropertyDetails> {
    // Step 1: Save Property
    const property = this.propertyDetailsRepository.create({
      propertyType: createPropertyDto.propertyType,
      description: createPropertyDto.description,
      propertyName: createPropertyDto.propertyName,
    });
    const savedPropertyDetails =
      await this.propertyDetailsRepository.save(property);

    // Step 2: Save ResidentialAttributes
    if (createPropertyDto.residentialAttributes) {
      const residentialAttributes = this.residentialAttributesRepository.create(
        {
          ...createPropertyDto.residentialAttributes,
          property: savedPropertyDetails,
        },
      );
      await this.residentialAttributesRepository.save(residentialAttributes);
    }

    // Step 3: Save PlotAttributes
    if (createPropertyDto.plotAttributes) {
      const plotAttributes = this.plotAttributesRepository.create({
        ...createPropertyDto.plotAttributes,
        property: savedPropertyDetails,
      });
      await this.plotAttributesRepository.save(plotAttributes);
    }

    //Save Commercial Details
    if (createPropertyDto.commercialAttributes) {
      const commercialAttributes = this.commercialAttributeRepository.create({
        ...createPropertyDto.commercialAttributes,
        property: savedPropertyDetails,
      });
      await this.commercialAttributeRepository.save(commercialAttributes);
    }

    if (createPropertyDto.flatshareAttributes) {
      let flatshare = this.flatshareRepo.create(
        createPropertyDto.flatshareAttributes,
      );
      flatshare = await this.flatshareRepo.save(flatshare);
      savedPropertyDetails.flatshareAttributes = flatshare;
      await this.propertyDetailsRepository.save(savedPropertyDetails);
    }

    //Save facilities
    // if (createPropertyDto.facilities) {
    //   const facilities = this.facilitiesRepository.create({
    //     ...createPropertyDto.facilities,
    //     property: savedPropertyDetails,
    //   });
    //   await this.facilitiesRepository.save(facilities);
    // }
    const commercialTypes = [
      'Office',
      'Retail Shop',
      'Show Room',
    ] as readonly string[];

    if (
      createPropertyDto.facilities &&
      commercialTypes.includes(createPropertyDto.propertyType)
    ) {
      const facilities = this.facilitiesRepository.create({
        ...createPropertyDto.facilities,
        property: savedPropertyDetails,
      });
      await this.facilitiesRepository.save(facilities);
    } else {
      (savedPropertyDetails as any).facilities = null;
    }

    //Save OccupancyDetails (specific to Flat Share)
    if (createPropertyDto.occupancyDetails) {
      const occupancyDetails = this.occupancyDetailsRepository.create({
        ...createPropertyDto.occupancyDetails,
        property: savedPropertyDetails,
      });
      await this.occupancyDetailsRepository.save(occupancyDetails);
    }

    // Step 4: Save PricingDetails
    if (createPropertyDto.pricingDetails) {
      const pricingDetails = this.pricingDetailsRepository.create({
        ...createPropertyDto.pricingDetails,
        property: savedPropertyDetails,
      });
      await this.pricingDetailsRepository.save(pricingDetails);
    }

    // Step 5: Save Furnishing
    if (createPropertyDto.furnishing) {
      const furnishing = this.furnishingRepository.create({
        ...createPropertyDto.furnishing,
        property: savedPropertyDetails,
      });
      await this.furnishingRepository.save(furnishing);
    }

    // Step 6: Save ConstructionStatus
    if (createPropertyDto.constructionStatus) {
      const constructionStatus = this.constructionStatusRepository.create({
        ...createPropertyDto.constructionStatus,
        property: savedPropertyDetails,
      });
      await this.constructionStatusRepository.save(constructionStatus);
    }

    // Step 8: Fetch Basic Details
    const basicDetails = await this.basicDetailsRepository.findOne({
      where: { propertyDetails: savedPropertyDetails },
    });

    // Step 8: Determine which relations to include
    const relations = this.getDynamicRelations(
      basicDetails?.purpose,
      basicDetails?.lookingType,
      createPropertyDto.propertyType,
    );

    if (basicDetails?.lookingType === lookingType.FlatShare) {
      if (!relations.includes('flatshareAttributes')) {
        relations.push('flatshareAttributes');
      }
    }
    // Fetch the property with the dynamically determined relations
    const propertyWithRelations = await this.propertyDetailsRepository.findOne({
      where: { id: savedPropertyDetails.id },
      relations: ['basicDetails', ...relations],
    });

    return propertyWithRelations;
  }

  private getDeepDifferences(
    original: Record<string, any>,
    updated: Record<string, any>,
    path: string[] = [],
  ): string[] {
    const changes: string[] = [];

    for (const key of Object.keys(updated)) {
      const fullPath = [...path, key];
      const originalValue = original?.[key];
      const updatedValue = updated[key];

      if (
        typeof updatedValue === 'object' &&
        updatedValue !== null &&
        !Array.isArray(updatedValue)
      ) {
        changes.push(
          ...this.getDeepDifferences(originalValue, updatedValue, fullPath),
        );
      } else if (
        JSON.stringify(originalValue) !== JSON.stringify(updatedValue)
      ) {
        if (originalValue === updatedValue) continue;

        const lastKey = fullPath[fullPath.length - 1];
        const label = this.capitalizeAndFormatKey(lastKey);

        changes.push(
          `${label}: " from ${originalValue ?? ''}" to "${updatedValue ?? ''}"`,
        );
      }
    }

    return changes;
  }

  private capitalizeAndFormatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  // Update a property partially or fully
  async updateProperty(
    propertyId: string,
    updatePropertyDto: CreatePropertyDto,
  ): Promise<Property> {
    const property = await this.getPropertyById(propertyId);
    const originalProperty = { ...property };

    // Update BasicDetails
    if (updatePropertyDto.basicDetails) {
      const updatedBasicDetails = {
        ...property.basicDetails,
        ...updatePropertyDto.basicDetails,
      };
      property.basicDetails =
        await this.basicDetailsRepository.save(updatedBasicDetails);
    }

    // Update LocationDetails
    if (updatePropertyDto.locationDetails) {
      const updatedLocationDetails = {
        ...property.locationDetails,
        ...updatePropertyDto.locationDetails,
      };
      property.locationDetails = await this.locationDetailsRepository.save(
        updatedLocationDetails,
      );
    }

    // Update PropertyDetails
    if (updatePropertyDto.propertyDetails) {
      property.propertyDetails = await this.updatingPropertyDetails(
        propertyId,
        updatePropertyDto.propertyDetails,
      );
    }

    // Update MediaDetails – delete from S3 any URLs that are being removed
    if (updatePropertyDto.mediaDetails) {
      const oldMedia = property.mediaDetails;
      const newImages = updatePropertyDto.mediaDetails.propertyImages ?? oldMedia?.propertyImages ?? [];
      const newVideos = updatePropertyDto.mediaDetails.propertyVideo ?? oldMedia?.propertyVideo ?? [];
      const oldImages = oldMedia?.propertyImages ?? [];
      const oldVideos = oldMedia?.propertyVideo ?? [];
      const imagesToDelete = oldImages.filter((u: string) => !newImages.includes(u));
      const videosToDelete = oldVideos.filter((u: string) => !newVideos.includes(u));
      for (const url of [...imagesToDelete, ...videosToDelete]) {
        if (url) {
          try {
            await this.s3Service.deleteFileByUrl(url);
          } catch (err) {
            console.warn('Failed to delete property media from S3:', err);
          }
        }
      }
      const updatedMediaDetails = {
        ...property.mediaDetails,
        ...updatePropertyDto.mediaDetails,
      };
      property.mediaDetails =
        await this.mediaDetailsRepository.save(updatedMediaDetails);
    }

    // Update top-level properties
    if (updatePropertyDto.currentStep !== undefined) {
      property.currentStep = updatePropertyDto.currentStep;
    }

    if (updatePropertyDto.isApproved !== undefined) {
      property.isApproved = updatePropertyDto.isApproved;
    }

    if (updatePropertyDto.approvedBy !== undefined) {
      property.approvedBy = updatePropertyDto.approvedBy;
    }

    if (updatePropertyDto.updatedBy !== undefined) {
      property.updatedBy = updatePropertyDto.updatedBy;
    }

    if (updatePropertyDto.isPosted !== undefined) {
      property.isPosted = updatePropertyDto.isPosted;
    }

    const updatedProperty = await this.propertyRepository.save(property);
    const changes = this.getDeepDifferences(originalProperty, updatedProperty);

    if (changes.length > 0) {
      const user = await this.userRepository.findOne({
        where: { id: property.owner?.id },
      });
      const propertyName =
        updatedProperty.propertyDetails?.propertyName || 'Property';

      if (user && updatedProperty?.updatedDate) {
        const formattedDate = updatedProperty.updatedDate.toLocaleString(
          'default',
          {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          },
        );
        const message = `Your ${propertyName} Property was updated \n- ${changes.join('\n- ')} on  ${formattedDate}`;

        await this.notificationService.createNotification({
          userId: user.id,
          message,
        });

        const emailTemplate = generatePropertyUpdateTemplate(user, changes);
        await this.notificationService.sendEmailNotification({
          email: user.email,
          template: emailTemplate,
        });
      }
    }

    return updatedProperty;
  }

  async updatingPropertyDetails(
    propertyId: string,
    updatePropertyDto: CreatePropertyDto['propertyDetails'],
  ): Promise<PropertyDetails> {
    // Step 1: Fetch the property
    const property = await this.getPropertyById(propertyId);

    if (!property.propertyDetails) {
      throw new NotFoundException(
        `PropertyDetails for Property ID ${propertyId} not found`,
      );
    }

    const propertyDetails = property.propertyDetails;

    // Step 2: Update existing fields in PropertyDetails
    if (updatePropertyDto.propertyType !== undefined) {
      propertyDetails.propertyType = updatePropertyDto.propertyType;
    }

    if (updatePropertyDto.description !== undefined) {
      propertyDetails.description = updatePropertyDto.description;
    }

    if (updatePropertyDto.propertyName !== undefined) {
      propertyDetails.propertyName = updatePropertyDto.propertyName;
    }

    // Step 3: Update ResidentialAttributes if provided
    if (updatePropertyDto.residentialAttributes) {
      const residentialAttributes = propertyDetails.residentialAttributes || {};
      Object.assign(
        residentialAttributes,
        updatePropertyDto.residentialAttributes,
      );
      propertyDetails.residentialAttributes =
        await this.residentialAttributesRepository.save(residentialAttributes);
    }

    // Step 4: Update PlotAttributes if provided
    if (updatePropertyDto.plotAttributes) {
      const plotAttributes = propertyDetails.plotAttributes || {};
      Object.assign(plotAttributes, updatePropertyDto.plotAttributes);
      propertyDetails.plotAttributes =
        await this.plotAttributesRepository.save(plotAttributes);
    }

    //Update Commercial Attributes
    if (updatePropertyDto.commercialAttributes) {
      const commercialAttributes = propertyDetails.commercialAttributes || {};
      Object.assign(
        commercialAttributes,
        updatePropertyDto.commercialAttributes,
      );
      propertyDetails.commercialAttributes =
        await this.commercialAttributeRepository.save(commercialAttributes);
    }

    //Update Facilities Attributes
    if (updatePropertyDto.facilities) {
      const facilities = propertyDetails.facilities || {};
      Object.assign(facilities, updatePropertyDto.facilities);
      propertyDetails.facilities =
        await this.facilitiesRepository.save(facilities);
    }

    // Step 5: Update OccupancyDetails if provided
    if (updatePropertyDto.occupancyDetails) {
      const occupancyDetails = propertyDetails.occupancyDetails || {};
      Object.assign(occupancyDetails, updatePropertyDto.occupancyDetails);
      propertyDetails.occupancyDetails =
        await this.occupancyDetailsRepository.save(occupancyDetails);
    }

    // Step 6: Update PricingDetails if provided
    if (updatePropertyDto.pricingDetails) {
      const pricingDetails = propertyDetails.pricingDetails || {};
      Object.assign(pricingDetails, updatePropertyDto.pricingDetails);
      propertyDetails.pricingDetails =
        await this.pricingDetailsRepository.save(pricingDetails);
    }

    // Step 7: Update Furnishing if provided
    // if (updatePropertyDto.furnishing) {
    //   const furnishing = propertyDetails.furnishing || {};
    //   Object.assign(furnishing, updatePropertyDto.furnishing);
    //   propertyDetails.furnishing =
    //     await this.furnishingRepository.save(furnishing);
    // }
    if (updatePropertyDto.furnishing) {
  const existing = propertyDetails.furnishing;

  if (!existing) {
    const created = this.furnishingRepository.create({
      ...updatePropertyDto.furnishing,
      property: propertyDetails,
    });
    propertyDetails.furnishing = await this.furnishingRepository.save(created);
  } else {
    const patch: Partial<Furnishing> = {};

    if (updatePropertyDto.furnishing.furnishedType !== undefined) {
      patch.furnishedType = updatePropertyDto.furnishing.furnishedType;
    }
    if (updatePropertyDto.furnishing.amenities !== undefined) {
      patch.amenities = updatePropertyDto.furnishing.amenities;
    }
    if (updatePropertyDto.furnishing.furnishings !== undefined) {
      patch.furnishings = updatePropertyDto.furnishing.furnishings;
    }

    this.furnishingRepository.merge(existing, patch);
    propertyDetails.furnishing = await this.furnishingRepository.save(existing);
  }
}


    // Step 8: Update ConstructionStatus if provided
    if (updatePropertyDto.constructionStatus) {
      const constructionStatus = propertyDetails.constructionStatus || {};
      Object.assign(constructionStatus, updatePropertyDto.constructionStatus);
      propertyDetails.constructionStatus =
        await this.constructionStatusRepository.save(constructionStatus);
    }

    // Step 10: Update FlatshareAttributes if provided
    if (updatePropertyDto.flatshareAttributes) {
      const flatshareAttributes = propertyDetails.flatshareAttributes || {};
      Object.assign(flatshareAttributes, updatePropertyDto.flatshareAttributes);
      propertyDetails.flatshareAttributes =
        await this.flatshareRepo.save(flatshareAttributes);
    }

    // Step 9: Save the updated PropertyDetails
    return await this.propertyDetailsRepository.save(propertyDetails);
  }

  // Fetch a property by ID with all related entities
  async getPropertyById(propertyId: string): Promise<any> {
    const property = await this.propertyRepository.findOne({
      where: { propertyId },
      relations: [
        'basicDetails',
        'locationDetails',
        'mediaDetails',
        'propertyDetails',
        'propertyDetails.residentialAttributes',
        'propertyDetails.plotAttributes',
        'propertyDetails.pricingDetails',
        'propertyDetails.occupancyDetails',
        'propertyDetails.furnishing',
        'propertyDetails.constructionStatus',
        'propertyDetails.commercialAttributes',
        'propertyDetails.flatshareAttributes',
        'propertyDetails.facilities',
        'postedByUser',
        'referralAgreements',
      ],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }
    const { postedByUser, ...rest } = property;

    return {
      ...rest,
      owner: {
        id: postedByUser.id,
        name: postedByUser.fullName,
        email: postedByUser.email,
        role: postedByUser.role,
        phone: postedByUser?.phone,
        profile: postedByUser?.profile,
      },
    };
  }

  async getAllPropertiesOfUser(userId: string): Promise<Property[]> {
    const userProperties = await this.propertyRepository.find({
      where: {
        postedByUser: { id: userId },
      },
      relations: [
        'basicDetails',
        'locationDetails',
        'propertyDetails',
        'propertyDetails.residentialAttributes',
        'propertyDetails.plotAttributes',
        'propertyDetails.pricingDetails',
        'propertyDetails.occupancyDetails',
        'propertyDetails.furnishing',
        'propertyDetails.constructionStatus',
        'propertyDetails.commercialAttributes',
        'propertyDetails.facilities',
        'mediaDetails',
      ],
    });
    if (!userProperties || userProperties.length === 0) {
      throw new NotFoundException(`No properties found for user ID ${userId}`);
    }
    return userProperties;
  }

  async getAllProperties(
    locality?: string[],
    city?: string[],
    propertyname?: string,
    propertytype?: string[],
    bhkType?: string[],
    lookingtype?: string[],
    facing?: string[],
    purpose?: string[],
    priceRange?: string[],
    buildupAreaRange?: string[],
    amenities?: string[],
    constructionStatus?: string | string[],
    furnishingType?: string[],
    ageOfProperty?: string[],
    page?: number,
    limit?: number,
    promotionTypes?: string[],
    saleType?: string[],
    genderPreference?: string[],
    sharingType?: string[],
    localityId?: string,
    referAndEarnOnly?: boolean,
  ): Promise<{
    data: any;
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      console.log('service looking', lookingtype);
      limit = Number(limit) || 10;
      // Default to 20 items per page
      page = Number(page) || 1;

      const queryBuilder =
        this.propertyRepository.createQueryBuilder('property');

      // Include relations
      queryBuilder
        .leftJoinAndSelect('property.basicDetails', 'basicDetails')
        .leftJoinAndSelect('property.locationDetails', 'locationDetails')
        .leftJoinAndSelect('property.propertyDetails', 'propertyDetails')
        .leftJoinAndSelect(
          'propertyDetails.residentialAttributes',
          'residentialAttributes',
        )
        .leftJoinAndSelect('propertyDetails.plotAttributes', 'plotAttributes')
        .leftJoinAndSelect('propertyDetails.pricingDetails', 'pricingDetails')
        .leftJoinAndSelect(
          'propertyDetails.occupancyDetails',
          'occupancyDetails',
        )
        .leftJoinAndSelect('propertyDetails.furnishing', 'furnishing')
        .leftJoinAndSelect(
          'propertyDetails.constructionStatus',
          'constructionStatus',
        )
        .leftJoinAndSelect(
          'propertyDetails.commercialAttributes',
          'commercialAttributes',
        )
        .leftJoinAndSelect(
          'propertyDetails.flatshareAttributes',
          'flatshareAttributes',
        )
        .leftJoinAndSelect('propertyDetails.facilities', 'facilities')
        .leftJoinAndSelect('property.mediaDetails', 'mediaDetails')
        .leftJoinAndSelect('property.postedByUser', 'postedByUser');

      // When refer-and-earn only: include active agreement so frontend can show referrerValue (earn amount)
      if (referAndEarnOnly) {
        queryBuilder.leftJoinAndSelect(
          'property.referralAgreements',
          'referralAgreements',
          'referralAgreements.status = :refStatus',
          { refStatus: 'ACTIVE' },
        );
      }

      // Mandatory Filter: Only fetch properties where isPosted = true
      queryBuilder.andWhere('property.isPosted = :isPosted', {
        isPosted: true,
      });

      // Optional Filter: Only Refer & Earn enabled properties
      if (referAndEarnOnly) {
        queryBuilder.andWhere('property.isReferAndEarnEnabled = :refer', {
          refer: true,
        });
      }

      // filter by locality: exact locationDetailsId match OR locality name match (so all properties in that area show when multiple location rows share the same name)
      if (localityId && locality && locality.length > 0) {
        queryBuilder.andWhere(
          `(property.locationDetailsId = :localityId OR (${locality.map((_, i) => `LOWER(locationDetails.locality) ILIKE :locality${i}`).join(' OR ')}))`,
          {
            localityId,
            ...Object.fromEntries(
              locality.map((l, i) => [`locality${i}`, `%${l.toLowerCase()}%`]),
            ),
          },
        );
      } else if (localityId) {
        queryBuilder.andWhere('property.locationDetailsId = :localityId', {
          localityId,
        });
      } else if (locality && locality.length > 0) {
        queryBuilder.andWhere(
          `(${locality.map((_, i) => `LOWER(locationDetails.locality) ILIKE :locality${i}`).join(' OR ')})`,
          Object.fromEntries(
            locality.map((l, i) => [`locality${i}`, `%${l.toLowerCase()}%`]),
          ),
        );
      }

      //filter by city
      if (city && city.length > 0) {
        queryBuilder.andWhere(`LOWER(locationDetails.city) IN (:...city)`, {
          city: city.map((c) => c.toLowerCase()),
        });
      }

      //filter by propertyname
      if (propertyname) {
        queryBuilder.andWhere(
          'propertyDetails.propertyName LIKE :propertyname',
          {
            propertyname: `%${propertyname}%`,
          },
        );
      }

      //filter by property_type
      if (propertytype && propertytype.length > 0) {
        queryBuilder.andWhere(
          'propertyDetails.propertyType IN (:...propertytype)',
          {
            propertytype,
          },
        );
      }

      //filter by bhk_type
      if (bhkType && bhkType.length > 0) {
        queryBuilder.andWhere('residentialAttributes.bhk IN (:...bhkType)', {
          bhkType,
        });
      }
      if (furnishingType && furnishingType.length > 0) {
        queryBuilder.andWhere(
          'furnishing.furnishedType IN (:...furnishingType)',
          {
            furnishingType,
          },
        );
      }

      //filter by facing
      if (facing && facing.length > 0) {
        queryBuilder.andWhere('residentialAttributes.facing IN (:...facing)', {
          facing,
        });
      }

      //filter by construction status
      if (constructionStatus && constructionStatus.length > 0) {
        queryBuilder.andWhere(
          'constructionStatus.status IN (:...constructionStatus)',
          {
            constructionStatus,
          },
        );
      }

      if (priceRange && priceRange.length > 0) {
        const formattedRanges = this.formatPriceRanges(priceRange);

        if (lookingtype?.some((type) => type.toLowerCase() === 'rent')) {
          this.applyRangeFilter(
            queryBuilder,
            'pricingDetails.monthlyRent',
            formattedRanges,
          );
        } else {
          this.applyRangeFilter(
            queryBuilder,
            'pricingDetails.expectedPrice',
            formattedRanges,
          );
        }
      }

      // Apply buildup area range filter
      if (buildupAreaRange && buildupAreaRange.length > 0) {
        this.applyRangeFilter(
          queryBuilder,
          `CAST("residentialAttributes"."buildupArea"->>'size' AS INTEGER)`,
          buildupAreaRange,
        );
      }

      // Apply property age range filter
      if (ageOfProperty && ageOfProperty.length > 0) {
        const numericRanges: string[] = ageOfProperty.map((range) => {
          return range.replace(/\s+years?/i, ''); // "0-5 years" => "0-5"
        });

        this.applyRangeFilter(
          queryBuilder,
          'constructionStatus.ageOfProperty',
          numericRanges,
        );
      }

      // Apply facilities filter
      if (amenities && amenities.length > 0) {
        queryBuilder.andWhere(
          `(LOWER(furnishing.amenities) ILIKE ANY (ARRAY[:...amenities]))`,
          { amenities: amenities.map((a) => `%${a.toLowerCase()}%`) },
        );
      }

      //filter by looking_type
      if (lookingtype && lookingtype.length > 0) {
        queryBuilder.andWhere('basicDetails.lookingType IN (:...lookingtype)', {
          lookingtype,
        });
      }

      //filter by purpose
      if (purpose && purpose.length > 0) {
        queryBuilder.andWhere('basicDetails.purpose IN (:...purpose)', {
          purpose,
        });
      }

      if (promotionTypes && promotionTypes.length > 0) {
        queryBuilder.andWhere(
          'property.promotionType && ARRAY[:...promotionTypes]',
          { promotionTypes },
        );
      }
      //filters for flatshare
      if (genderPreference && genderPreference.length > 0) {
        queryBuilder.andWhere(
          'flatshareAttributes.lookingFor IN (:...genderPreference)',
          {
            genderPreference,
          },
        );
      }

      if (sharingType && sharingType.length > 0) {
        queryBuilder.andWhere(
          'flatshareAttributes.occupancy IN (:...sharingType)',
          {
            sharingType,
          },
        );
      }

      // Pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Get total count for pagination
      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / limit);

      // Execute the query
      let data = await queryBuilder.getMany();
      if (buildupAreaRange?.length === 2) {
        const [minArea, maxArea] = buildupAreaRange.map(Number); // Convert to number

        data = data.filter((property) => {
          const isResidential =
            property?.basicDetails?.purpose === 'Residential';

          const area = isResidential
            ? property?.propertyDetails?.residentialAttributes?.buildupArea
                ?.size
            : property?.propertyDetails?.commercialAttributes?.builtUpArea
                ?.size;

          return typeof area === 'number' && area >= minArea && area <= maxArea;
        });
      }

      const formattedData = data.map((property) => {
        const { postedByUser, ...rest } = property;

        return {
          ...rest,
          owner: {
            name: postedByUser.fullName,
            email: postedByUser.email,
            role: postedByUser.role,
            phone: postedByUser?.phone,
            profile: postedByUser?.profile,
          },
        };
      });

      return {
        data: formattedData,
        total,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      return {
        data: {
          status: 'failure',
          code: error?.code || 500,
          message: 'an error occured while fetching properties.',
          details: error?.message || null,
        },
        total: 0,
        currentPage: 0,
        totalPages: 0,
      };
    }
  }

  async getPendingProperty(userId: string): Promise<Property> {
    const pendingProperties = await this.propertyRepository.findOne({
      where: {
        postedByUser: { id: userId },
        isPosted: false,
      },
      relations: [
        'basicDetails',
        'locationDetails',
        'propertyDetails',
        'propertyDetails.residentialAttributes',
        'propertyDetails.flatshareAttributes',
        'propertyDetails.plotAttributes',
        'propertyDetails.pricingDetails',
        'propertyDetails.occupancyDetails',
        'propertyDetails.furnishing',
        'propertyDetails.constructionStatus',
        'propertyDetails.commercialAttributes',
        'propertyDetails.facilities',
        'mediaDetails',
      ],
    });

    return pendingProperties;
  }

  // Delete a property and all its related entities
  async deleteProperty(propertyId: string): Promise<{ message: string }> {
    const property = await this.getPropertyById(propertyId);

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Unlink related entities from the property
    if (property.basicDetails) {
      await this.propertyRepository.update(propertyId, { basicDetails: null });
      await this.basicDetailsRepository.delete(property.basicDetails.id);
    }

    if (property.locationDetails) {
      await this.propertyRepository.update(propertyId, {
        locationDetails: null,
      });
      await this.locationDetailsRepository.delete(property.locationDetails.id);
    }

    if (property.propertyDetails) {
      await this.propertyRepository.update(propertyId, {
        propertyDetails: null,
      });
      await this.deletePropertyDetails(property.propertyDetails);
    }

    if (property.mediaDetails) {
      const urls = [
        ...(property.mediaDetails.propertyImages ?? []),
        ...(property.mediaDetails.propertyVideo ?? []),
      ].filter(Boolean);
      for (const url of urls) {
        try {
          await this.s3Service.deleteFileByUrl(url);
        } catch (err) {
          console.warn('Failed to delete property media from S3:', err);
        }
      }
      await this.propertyRepository.update(propertyId, { mediaDetails: null });
      await this.mediaDetailsRepository.delete(property.mediaDetails.id);
    }

    // Delete the property itself
    await this.propertyRepository.delete(propertyId);

    return {
      message: `Property with ID ${propertyId} and its related data have been deleted successfully.`,
    };
  }

  /*******************************************ADMIN SERVICES*************************************/
async adminAddProperty(adminUserId: string, createPropertyDto: CreatePropertyDto): Promise<Property> {
  const user = await this.userRepository.findOne({ where: { id: adminUserId } });
  if (!user) throw new NotFoundException('User not found');

  const newProperty = this.propertyRepository.create({
    currentStep: 4,
    isPosted: true,
    isApproved: true,
    postedByUser: user,
  });

  // 1) Create propertyDetails first (so other entities can link to it)
  if (createPropertyDto.propertyDetails) {
    const propertyDetails = await this.createPropertyWithRelations(createPropertyDto.propertyDetails);
    newProperty.propertyDetails = propertyDetails;
  }

  // 2) Now save basicDetails and LINK it to propertyDetails (important)
  if (createPropertyDto.basicDetails) {
    const basicDetails = this.basicDetailsRepository.create({
      ...createPropertyDto.basicDetails,
      propertyDetails: newProperty.propertyDetails, // ✅ link
    });
    newProperty.basicDetails = await this.basicDetailsRepository.save(basicDetails);
  }

  if (createPropertyDto.locationDetails) {
    const locationDetails = this.locationDetailsRepository.create(createPropertyDto.locationDetails);
    newProperty.locationDetails = await this.locationDetailsRepository.save(locationDetails);
  }

  if (createPropertyDto.mediaDetails) {
    const mediaDetails = this.mediaDetailsRepository.create(createPropertyDto.mediaDetails);
    newProperty.mediaDetails = await this.mediaDetailsRepository.save(mediaDetails);
  }

  const saved = await this.propertyRepository.save(newProperty);

  // ✅ return with full relations so preview never shows null
  return await this.propertyRepository.findOne({
    where: { propertyId: saved.propertyId },
    relations: [
      'basicDetails',
      'locationDetails',
      'mediaDetails',
      'propertyDetails',
      'propertyDetails.furnishing',
      'propertyDetails.pricingDetails',
      'propertyDetails.residentialAttributes',
      'propertyDetails.constructionStatus',
      'propertyDetails.commercialAttributes',
      'propertyDetails.plotAttributes',
      'propertyDetails.facilities',
      'propertyDetails.flatshareAttributes',
      'propertyDetails.occupancyDetails',
      'postedByUser',
    ],
  });
}
async adminUpdateProperty(propertyId: string, updatePropertyDto: CreatePropertyDto): Promise<Property> {
  await this.updateProperty(propertyId, updatePropertyDto);

  return await this.propertyRepository.findOne({
    where: { propertyId },
    relations: [
      'basicDetails',
      'locationDetails',
      'mediaDetails',
      'propertyDetails',
      'propertyDetails.furnishing',
      'propertyDetails.pricingDetails',
      'propertyDetails.residentialAttributes',
      'propertyDetails.constructionStatus',
      'propertyDetails.commercialAttributes',
      'propertyDetails.plotAttributes',
      'propertyDetails.facilities',
      'propertyDetails.flatshareAttributes',
      'propertyDetails.occupancyDetails',
      'postedByUser',
    ],
  });
}

//   async adminAddProperty(
//     adminUserId: string,
//     createPropertyDto: CreatePropertyDto,
//   ): Promise<Property> {
//     const user = await this.userRepository.findOne({
//       where: { id: adminUserId },
//     }); // Ensure user exists

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }
//     const newProperty = this.propertyRepository.create({
//       currentStep: 4, // Admin adds full details, assume completed
//       isPosted: true, // Mark as posted
//       isApproved: true, // Assume approved by admin
//       ...createPropertyDto,
//       postedByUser: user, // Assign the admin user ID
//     });

//     // Save related entities
//     if (createPropertyDto.basicDetails) {
//       const basicDetails = this.basicDetailsRepository.create(
//         createPropertyDto.basicDetails,
//       );
//       newProperty.basicDetails =
//         await this.basicDetailsRepository.save(basicDetails);
//     }

//     if (createPropertyDto.locationDetails) {
//       const locationDetails = this.locationDetailsRepository.create(
//         createPropertyDto.locationDetails,
//       );
//       newProperty.locationDetails =
//         await this.locationDetailsRepository.save(locationDetails);
//     }

//     if (createPropertyDto.propertyDetails) {
//       const propertyDetails = await this.createPropertyWithRelations(
//         createPropertyDto.propertyDetails,
//       );
//       newProperty.propertyDetails = propertyDetails;
//       if (createPropertyDto.basicDetails) {
//   const basicDetails = this.basicDetailsRepository.create({
//     ...createPropertyDto.basicDetails,
//     propertyDetails: propertyDetails, // ✅ link here
//   });
//   newProperty.basicDetails = await this.basicDetailsRepository.save(basicDetails);
// }
//     }

//     if (createPropertyDto.mediaDetails) {
//       const mediaDetails = this.mediaDetailsRepository.create(
//         createPropertyDto.mediaDetails,
//       );
//       newProperty.mediaDetails =
//         await this.mediaDetailsRepository.save(mediaDetails);
//     }

//     return await this.propertyRepository.save(newProperty);
//   }

  // async adminUpdateProperty(
  //   propertyId: string,
  //   updatePropertyDto: CreatePropertyDto,
  // ): Promise<Property> {
  //   return await this.updateProperty(propertyId, updatePropertyDto);
  // }

  async adminDeleteProperty(propertyId: string): Promise<{ message: string }> {
    return await this.deleteProperty(propertyId); // Reuse existing deleteProperty logic
  }

  async adminGetAllProperties(
    page?: number, // Page comes as an optional query parameter
  ): Promise<{
    data: Property[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    return await this.getAllProperties(); //Reuse existing get all properties method.
  }

  // New admin method with filters for property status
  async adminGetAllPropertiesWithFilters(
    page: number = 1,
    limit: number = 10,
    status: 'all' | 'pending' | 'approved' | 'posted' | 'draft' = 'all',
    search?: string,
  ): Promise<{
    data: any[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const queryBuilder = this.propertyRepository.createQueryBuilder('property');

      // Include all relations
      queryBuilder
        .leftJoinAndSelect('property.basicDetails', 'basicDetails')
        .leftJoinAndSelect('property.locationDetails', 'locationDetails')
        .leftJoinAndSelect('property.propertyDetails', 'propertyDetails')
        .leftJoinAndSelect('propertyDetails.residentialAttributes', 'residentialAttributes')
        .leftJoinAndSelect('propertyDetails.plotAttributes', 'plotAttributes')
        .leftJoinAndSelect('propertyDetails.pricingDetails', 'pricingDetails')
        .leftJoinAndSelect('propertyDetails.occupancyDetails', 'occupancyDetails')
        .leftJoinAndSelect('propertyDetails.furnishing', 'furnishing')
        .leftJoinAndSelect('propertyDetails.constructionStatus', 'constructionStatus')
        .leftJoinAndSelect('propertyDetails.commercialAttributes', 'commercialAttributes')
        .leftJoinAndSelect('propertyDetails.flatshareAttributes', 'flatshareAttributes')
        .leftJoinAndSelect('propertyDetails.facilities', 'facilities')
        // .leftJoinAndSelect('propertyDetails.furnishing', 'furnishing')
        .leftJoinAndSelect('property.mediaDetails', 'mediaDetails')
        .leftJoinAndSelect('property.postedByUser', 'postedByUser');

      // Apply status filter
      switch (status) {
        case 'pending':
          // Properties that are posted but not yet approved
          queryBuilder.andWhere('property.isPosted = :isPosted', { isPosted: true });
          queryBuilder.andWhere('property.isApproved = :isApproved', { isApproved: false });
          break;
        case 'approved':
          // Properties that are approved
          queryBuilder.andWhere('property.isApproved = :isApproved', { isApproved: true });
          break;
        case 'posted':
          // Properties that are posted (visible to public)
          queryBuilder.andWhere('property.isPosted = :isPosted', { isPosted: true });
          break;
        case 'draft':
          // Properties that are not yet posted (incomplete)
          queryBuilder.andWhere('property.isPosted = :isPosted', { isPosted: false });
          break;
        case 'all':
        default:
          // No filter, return all properties
          break;
      }

      // Apply search filter
      if (search && search.trim() !== '') {
        queryBuilder.andWhere(
          '(propertyDetails.propertyName ILIKE :search OR locationDetails.locality ILIKE :search OR locationDetails.city ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Order by most recent first
      queryBuilder.orderBy('property.updatedDate', 'DESC');

      // Pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Get total count
      const total = await queryBuilder.getCount();
      const totalPages = Math.ceil(total / limit);

      // Execute query
      const data = await queryBuilder.getMany();

      // Format data with owner info
      const formattedData = data.map((property) => {
        const { postedByUser, ...rest } = property;

        return {
          ...rest,
          owner: postedByUser ? {
            id: postedByUser.id,
            name: postedByUser.fullName,
            email: postedByUser.email,
            phone: postedByUser?.phone,
            profile: postedByUser?.profile,
          } : null,
        };
      });

      return {
        data: formattedData,
        total,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching admin properties:', error);
      return {
        data: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
      };
    }
  }

  // Get property status counts for admin dashboard
  async getPropertyStatusCounts(): Promise<{
    all: number;
    pending: number;
    approved: number;
    draft: number;
  }> {
    try {
      const queryBuilder = this.propertyRepository.createQueryBuilder('property');

      // Total count (all properties)
      const all = await queryBuilder.getCount();

      // Pending: isPosted = true AND isApproved = false
      const pending = await this.propertyRepository
        .createQueryBuilder('property')
        .where('property.isPosted = :isPosted', { isPosted: true })
        .andWhere('property.isApproved = :isApproved', { isApproved: false })
        .getCount();

      // Approved: isApproved = true
      const approved = await this.propertyRepository
        .createQueryBuilder('property')
        .where('property.isApproved = :isApproved', { isApproved: true })
        .getCount();

      // Draft: isPosted = false
      const draft = await this.propertyRepository
        .createQueryBuilder('property')
        .where('property.isPosted = :isPosted', { isPosted: false })
        .getCount();

      return { all, pending, approved, draft };
    } catch (error) {
      console.error('Error fetching status counts:', error);
      return { all: 0, pending: 0, approved: 0, draft: 0 };
    }
  }

  // Approve or reject a property
  async approveProperty(
    propertyId: string,
    isApproved: boolean,
    approvedBy: string,
    isPosted?: boolean,
    rejectionReason?: string,
  ): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { propertyId },
      relations: ['postedByUser', 'propertyDetails', 'locationDetails'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found.`);
    }

    property.isApproved = isApproved;
    property.approvedBy = approvedBy;
    property.approvedDate = new Date();
    property.updatedBy = approvedBy;
    property.updatedDate = new Date();

    // If explicitly setting isPosted
    if (isPosted !== undefined) {
      property.isPosted = isPosted;
      if (isPosted && !property.postedDate) {
        property.postedDate = new Date();
      }
    }

    const savedProperty = await this.propertyRepository.save(property);

    // Send notification to property owner
    if (property.postedByUser) {
      const propertyName = property.propertyDetails?.propertyName || 'Your property';
      const message = isApproved
        ? `Great news! ${propertyName} has been approved and is now live on OneCasa.`
        : `${propertyName} was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please contact support for more details.'}`;

      await this.notificationService.createNotification({
        userId: property.postedByUser.id,
        message,
      });
    }

    return savedProperty;
  }

  async getSpecificProperty(propertyId: string): Promise<Property> {
    return await this.getPropertyById(propertyId); // Reuse existing getPropertyById logic
  }

  async getCityProjects(cityName: string) {
    try {
      const projects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.location', 'location')
        .leftJoinAndSelect('project.propertyType', 'propertyType')
        .leftJoinAndSelect('propertyType.units', 'units')
        .where('LOWER(location.city) = :cityName', {
          cityName: cityName.toLowerCase(),
        })
        .getMany();

      // Map to add bhkTypes array
      const projectsWithBhk = projects.map((proj) => {
        const bhkTypes =
          proj.propertyType?.units
            ?.map((unit) => unit.BHK)
            .filter((bhk) => bhk && bhk.trim() !== '') || [];

        return {
          ...proj,
          bhkTypes,
        };
      });

      return projectsWithBhk;
    } catch (error) {
      throw new Error('Error while fetching projects');
    }
  }

  /*******************************************HELPER FUNCTIONS*************************************************/

  private getDynamicRelations(
    purpose: string | undefined,
    lookingType: string | undefined,
    propertyType: string | undefined,
  ): string[] {
    const relations: string[] = [];

    if (purpose === 'residential') {
      if (lookingType === 'Flat Share') {
        relations.push(
          'residentialAttributes',
          'occupancyDetails',
          'pricingDetails',
          'furnishing',
          'flatshareAttributes',
        );
      } else if (lookingType === 'Rent' || lookingType === 'Sell') {
        relations.push('residentialAttributes', 'pricingDetails');
        if (
          [
            'Apartment',
            'Independent Floor',
            'Villa',
            'Independent House',
          ].includes(propertyType)
        ) {
          relations.push('furnishing', 'constructionStatus');
        }
      } else if (propertyType === 'Plot') {
        relations.push('plotAttributes', 'pricingDetails');
      } else {
        relations.push(
          'residentialAttributes',
          'pricingDetails',
          'constructionStatus',
        );
      }
    } else if (purpose === 'commercial') {
      relations.push(
        'commercialAttributes',
        'facilities',
        'pricingDetails',
        'constructionStatus',
      );
    }

    return relations;
  }

  private async deletePropertyDetails(propertyDetails: any): Promise<void> {
    if (propertyDetails.residentialAttributes) {
      await this.residentialAttributesRepository.delete(
        propertyDetails.residentialAttributes.id,
      );
    }

    if (propertyDetails.plotAttributes) {
      await this.plotAttributesRepository.delete(
        propertyDetails.plotAttributes.id,
      );
    }

    if (propertyDetails.commercialPropertyAttribute) {
      await this.commercialAttributeRepository.delete(
        propertyDetails.commercialPropertyAttribute.id,
      );
    }

    if (propertyDetails.facilities) {
      await this.facilitiesRepository.delete(propertyDetails.facilities.id);
    }

    if (propertyDetails.pricingDetails) {
      await this.pricingDetailsRepository.delete(
        propertyDetails.pricingDetails.id,
      );
    }

    if (propertyDetails.occupancyDetails) {
      await this.occupancyDetailsRepository.delete(
        propertyDetails.occupancyDetails.id,
      );
    }

    if (propertyDetails.furnishing) {
      await this.furnishingRepository.delete(propertyDetails.furnishing.id);
    }

    if (propertyDetails.constructionStatus) {
      await this.constructionStatusRepository.delete(
        propertyDetails.constructionStatus.id,
      );
    }

    await this.propertyDetailsRepository.delete(propertyDetails.id);
  }

  private applyRangeFilter(
    queryBuilder: SelectQueryBuilder<Property>,
    column: string,
    ranges?: string[] | string[][] | number[] | number[][],
  ) {
    if (!ranges || ranges.length === 0) return;
    const MAX_SAFE_DB_VALUE = 9999999999;

    // Ensure ranges is always an array of arrays
    const formattedRanges: string[][] = Array.isArray(ranges[0])
      ? (ranges as string[][])
      : [ranges as string[]];

    const conditions: string[] = [];
    const params: Record<string, number> = {};

    formattedRanges.forEach((range, index) => {
      const minValue = parseInt(range[0]) || 0;
      const maxValue = parseInt(range[1]) || MAX_SAFE_DB_VALUE;

      const sanitizedColumn = column.replace(/[^a-zA-Z0-9_]/g, '_');
      // Generate unique parameter keys using column name
      const minParam = `${sanitizedColumn}_min${index}`;
      const maxParam = `${sanitizedColumn}_max${index}`;

      conditions.push(`${column} BETWEEN :${minParam} AND :${maxParam}`);
      params[minParam] = minValue;
      params[maxParam] = maxValue;
    });

    queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
  }

  // Helper function to convert values like "50L" to "5000000"
  private convertToNumber(value: string): string {
    const num = parseFloat(value);
    if (value.includes('L')) return (num * 100000).toString(); // Convert Lakhs to Numbers
    if (value.includes('Cr')) return (num * 10000000).toString(); // Convert Crores to Numbers
    return num.toString();
  }

  private formatPriceRanges(ranges: string[]): string[][] {
    const MAX_SAFE_DB_VALUE = '9999999999';

    return ranges.map((range) => {
      const cleanedRange = range.replace(/₹|\s/g, ''); // Remove currency symbol and spaces

      if (cleanedRange.includes('+')) {
        // Handle '₹5Cr+' case → Convert "5Cr+" to ["50000000", "MAX_SAFE_DB_VALUE"]
        const min = this.convertToNumber(cleanedRange.replace('+', ''));
        return [min, MAX_SAFE_DB_VALUE];
      }

      // Handle normal "₹X - ₹Y" cases
      const [min, max] = cleanedRange.split('-');
      return [this.convertToNumber(min), this.convertToNumber(max)];
    });
  }

  async updatePromotionType(
    propertyId: string,
    promotionType: PromotionTypeEnum[],
    promotionExpiry: Date | undefined,
    approvedBy: string,
    updatedBy: string,
    promotionTags?: string[],
  ): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found.`);
    }
    property.promotionType = promotionType;
    property.promotionExpiry = promotionExpiry;
    if (promotionTags !== undefined) property.promotionTags = promotionTags;
    property.approvedBy = approvedBy;
    property.approvedDate = new Date();
    property.updatedBy = updatedBy;
    property.updatedDate = new Date();
    return await this.propertyRepository.save(property);
  }

  /** Search localities by any searchable field: locality, city, subLocality, area, landmark, zone, street */
  async searchLocalities(
    search: string,
    city?: string,
    lookingTypes: string[] = [],
  ) {
    const searchTerm = `%${search}%`;
    const query = this.locationDetailsRepository
      .createQueryBuilder('location')
      .where(
        '(location.locality ILIKE :search OR location.city ILIKE :search OR location.subLocality ILIKE :search OR location.area ILIKE :search OR location.landmark ILIKE :search OR location.zone ILIKE :search OR location.street ILIKE :search)',
        { search: searchTerm },
      );

    if (city) {
      query.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }

    if (lookingTypes.length > 0) {
      query.andWhere(
        (qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from('property', 'property')
            .innerJoin('property.basicDetails', 'basicDetails')
            .where('property.locationDetailsId = location.id')
            .andWhere(
              'LOWER(basicDetails.lookingType :: TEXT) IN (:...lookingTypes)',
            )
            .getQuery();
          return `EXISTS ${subQuery}`;
        },
        { lookingTypes: lookingTypes.map((t) => t.toLowerCase()) },
      );
    }

    return query.limit(15).getMany();
  }

  /** Properties whose location matches the search (locality, city, subLocality, area, landmark, zone, street) */
  async searchPropertiesByLocality(
    search: string,
    city?: string,
    lookingTypes: string[] = [],
  ) {
    const searchTerm = `%${search}%`;
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.propertyDetails', 'propertyDetails')
      .leftJoinAndSelect('property.locationDetails', 'location')
      .leftJoinAndSelect('property.basicDetails', 'basicDetails')
      .where('property.isPosted = :isPosted', { isPosted: true })
      .andWhere(
        '(location.locality ILIKE :search OR location.city ILIKE :search OR location.subLocality ILIKE :search OR location.area ILIKE :search OR location.landmark ILIKE :search OR location.zone ILIKE :search OR location.street ILIKE :search)',
        { search: searchTerm },
      );

    if (city) {
      query.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }
    if (lookingTypes.length > 0) {
      query.andWhere(
        'LOWER(basicDetails.lookingType :: TEXT) IN (:...lookingTypes)',
        { lookingTypes: lookingTypes.map((lt) => lt.toLowerCase()) },
      );
    }
    return query.limit(10).getMany();
  }

  /** Properties whose name matches the search */
  async searchPropertiesByName(
    search: string,
    city?: string,
    lookingTypes: string[] = [],
  ) {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.propertyDetails', 'propertyDetails')
      .leftJoinAndSelect('property.locationDetails', 'location')
      .leftJoinAndSelect('property.basicDetails', 'basicDetails')
      .where('property.isPosted = :isPosted', { isPosted: true })
      .andWhere('propertyDetails.propertyName ILIKE :search', {
        search: `%${search}%`,
      });

    if (city) {
      query.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }
    if (lookingTypes.length > 0) {
      query.andWhere(
        'LOWER(basicDetails.lookingType :: TEXT) IN (:...lookingTypes)',
        {
          lookingTypes: lookingTypes.map((lt) => lt.toLowerCase()),
        },
      );
    }
    return query.limit(10).getMany();
  }

  async findPropertyBySlug(slug: string, city: string) {
    const cleaned = slug.trim().toLowerCase().replace(/-/g, ' ');

    return await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.propertyDetails', 'details')
      .leftJoinAndSelect('property.locationDetails', 'location')
      .where('LOWER(details.propertyName) ILIKE :name', {
        name: `%${cleaned}%`,
      })
      .andWhere('LOWER(location.city) ILIKE :city', {
        city: `%${city.toLowerCase()}%`,
      })
      .getOne();
  }

  //getcitywiseProperties count

  async getCityWisePropertyCounts() {
    return this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.locationDetails', 'location')
      .where('location.city IS NOT NULL')
      .select('LOWER(location.city)', 'city')
      .addSelect('COUNT(property.propertyId)', 'count')
      .groupBy('LOWER(location.city)')
      .getRawMany();
  }
}
