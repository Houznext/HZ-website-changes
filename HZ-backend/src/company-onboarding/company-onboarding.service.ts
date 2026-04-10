import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { ILike, Repository } from 'typeorm';
import { DeveloperInformation } from './entities/developer-information.entity';
import {
  CompanyDto,
  DeleteSellerDto,
  ProjectDto,
  SaveSellerDetailsDto,
  SellerDto,
  UpdateCompanyDto,
  UpdateProjectDto,
  updateSellerDetailsDto,
  VerifyDeveloperEmailDto,
  verifyDeveloperOtpDto,
  VerifySellerEmailDto,
  verifySellerOtpDto,
} from './dto/company-onboarding.dto';
import { Project } from './entities/company-projects.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LocationDetails } from 'src/property/entities/location.entity';
import { ConstructionStatus } from 'src/property/entities/property-details/constructionStatus.entity';
import { MediaDetails } from 'src/property/entities/mediaDetails.entity';
import { PropertyType } from './entities/project-property-type.entity';
import { Sellers } from './entities/company-property-sellers.entity';
import { FlooringPlans } from './entities/units-floor-planing.entity';
import { User } from 'src/user/entities/user.entity';
import { OtpService } from 'src/otp/otp.service';
import { UserKind } from 'src/user/enum/user.enum';
import * as bcrypt from 'bcrypt';
import { Units } from './entities/property-type-units.entity';
import { PopularBuilderDto, ProjectFilterDto } from './dto/project.filter.dto';
import { PromotionTypeEnum } from './Enum/company.enum';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { generateProjectUpdateTemplate } from 'src/emailTemplates';
import { S3Service } from 'src/common/s3/s3.service';

export class CompanyOnboardingService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(DeveloperInformation)
    private readonly developerRepository: Repository<DeveloperInformation>,
    @InjectRepository(LocationDetails)
    private readonly locationRepository: Repository<LocationDetails>,
    @InjectRepository(ConstructionStatus)
    private readonly constructionDetailsRepository: Repository<ConstructionStatus>,
    @InjectRepository(MediaDetails)
    private readonly mediaDetailsRepository: Repository<MediaDetails>,
    @InjectRepository(PropertyType)
    private readonly propertyTypeRepository: Repository<PropertyType>,
    @InjectRepository(Units)
    private readonly unitsRepository: Repository<Units>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FlooringPlans)
    private readonly flooringPlansRepository: Repository<FlooringPlans>,
    private readonly otpService: OtpService,
    private readonly mailerService: MailerService,
    private readonly notificationService: NotificationService,
    private readonly s3Service: S3Service,
  ) {}

  //fetch the projects by userId

  async getProjectsOfLoggedInBuilder(userId: string): Promise<Project[]> {
    const developer = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'company',
        'company.projects',
        'company.developerInformation',

        'company.projects.company',
        'company.projects.location',
        'company.projects.mediaDetails',
        'company.projects.propertyType',
        'company.projects.propertyType.units',
        'company.projects.propertyType.units.flooringPlans',
        'company.projects.constructionStatus',
      ],
    });

    if (!developer) {
      throw new NotFoundException('Developer not found.');
    }

    if (!developer.company) {
      throw new NotFoundException('No company associated with this developer.');
    }

    return developer.company.projects;
  }

  // Verify developer email

  async verifyDeveloperEmail({ email }: VerifyDeveloperEmailDto) {
    try {
      const developer = await this.userRepository.findOne({
        where: { email },
        relations: ['company'],
      });

      if (developer && developer.isVerified) {
        if (developer.kind !== UserKind.SELLER) {
          developer.kind = UserKind.SELLER;
          await this.userRepository.save(developer);
        }

        // If developer is already associated with a company
        if (developer.company !== null) {
          throw new BadRequestException(
            'Company already exist with this developer email',
          );
        } else {
          const company = this.companyRepository.create({
            developerInformation: developer,
            RERAId: '',
            about: '',
            companyName: '',
            estdYear: 0,
            Logo: [],
          });
          await this.companyRepository.save(company);
          return {
            message: 'Your email is already verified',
          };
        }
      } else {
        const response = await this.otpService.sendOtp({ email });
        return response;
      }
    } catch (error) {
      console.log('error in verifyDeveloperEmail', error.message);
      throw error;
    }
  }

  // Verify developer otp

  async verifyDeveloperOtp({ email, otp }: verifyDeveloperOtpDto) {
    try {
      const verifiedOtp = await this.otpService.verifyOtp({ email, otp });

      if (!verifiedOtp?.email) {
        throw new BadRequestException('Invalid OTP');
      }

      const existingDeveloper = await this.userRepository.findOne({
        where: { email },
        relations: ['company'],
      });

      if (existingDeveloper) {
        existingDeveloper.isVerified = true;
        existingDeveloper.kind = UserKind.SELLER;
        await this.userRepository.save(existingDeveloper);

        const company = this.companyRepository.create({
          developerInformation: existingDeveloper,
          RERAId: '',
          about: '',
          companyName: '',
          estdYear: 0,
          Logo: [],
        });
        await this.companyRepository.save(company);
      } else {
        const developer = this.userRepository.create({
          email,
          isVerified: true,
          username: `user_${Date.now()}`,
          password: '',
          kind: UserKind.SELLER,
        });

        await this.userRepository.save(developer);

        const company = this.companyRepository.create({
          developerInformation: developer,
          RERAId: '',
          about: '',
          companyName: '',
          estdYear: 0,
          Logo: [],
        });
        await this.companyRepository.save(company);
      }

      return {
        message: 'Email verified successfully',
      };
    } catch (error) {
      console.log('error in verifyDeveloperOtp', error.message);
      throw error;
    }
  }

  // Create company
  async addCompany(companyDto: CompanyDto): Promise<Company> {
    const { developerInformation, RERAId, ...companyData } = companyDto;

    if (!RERAId) {
      throw new Error('RERAId is required for creating a company.');
    }
    let existingCompany = await this.companyRepository.findOne({
      where: { RERAId },
      relations: ['developerInformation'],
    });
    if (existingCompany) {
      return existingCompany;
    }

    // Save DeveloperInformation first
    const developer = await this.userRepository.findOne({
      where: { email: developerInformation.officialEmail },
      relations: ['roles', 'company'],
    });

    if (!developer || !developer.isVerified) {
      throw new BadRequestException('Developer email is not verified');
    }

    // Update developer created while verifying OTP

    developer.whatsappNumber = developerInformation.whatsappNumber;
    developer.phone = developerInformation.PhoneNumber;
    developer.fullName = developerInformation.Name;

    const savedDeveloper = await this.userRepository.save(developer);

    // Update company created while verifying OTP

    const company = await this.companyRepository.findOne({
      where: { id: developer.company.id },
    });

    const updatedCompany = Object.assign(company, {
      ...companyData,
      RERAId,
      developerInformation: savedDeveloper,
    });

    const savedCompany = await this.companyRepository.save(updatedCompany);

    return this.companyRepository.findOne({
      where: { id: savedCompany.id },
      relations: ['developerInformation'],
    });
  }

  async updateCompany(
    companyId: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['developerInformation'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    if (
      company.developerInformation.email !==
      updateCompanyDto.developerInformation.officialEmail
    ) {
      throw new BadRequestException(
        'Given developer email does not match with the company developer email',
      );
    }

    const updatedCompanyData = {};

    // Update developer information if provided
    if (updateCompanyDto.developerInformation) {
      company.developerInformation.fullName =
        updateCompanyDto.developerInformation.Name;
      company.developerInformation.phone =
        updateCompanyDto.developerInformation.PhoneNumber;
      company.developerInformation.whatsappNumber =
        updateCompanyDto.developerInformation.whatsappNumber;

      await this.userRepository.save(company.developerInformation);
    }

    if (updateCompanyDto.RERAId) {
      company.RERAId = updateCompanyDto.RERAId;
    }

    if (updateCompanyDto.companyName) {
      company.companyName = updateCompanyDto.companyName;
    }

    if (updateCompanyDto.estdYear) {
      company.estdYear = updateCompanyDto.estdYear;
    }

    if (updateCompanyDto.Logo) {
      company.Logo = updateCompanyDto.Logo;
    }

    if (updateCompanyDto.about) {
      company.about = updateCompanyDto.about;
    }

    // Update other company fields
    const updatedCompany = Object.assign(company, updatedCompanyData);
    await this.companyRepository.save(updatedCompany);

    return this.companyRepository.findOne({
      where: { id: company.id },
      relations: ['developerInformation'],
    });
  }

  async addProjectToCompany(
    companyId: string,
    projectDto: ProjectDto,
  ): Promise<Project> {
    // Find the company by its ID
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Extract and save the related entities first
    const {
      location,
      mediaDetails,
      constructionStatus,
      propertyType,
      ...projectData
    } = projectDto;

    // Save Location
    const savedLocation = location
      ? await this.locationRepository.save(
          this.locationRepository.create(location),
        )
      : null;

    // Save MediaDetails
    const savedMediaDetails = mediaDetails
      ? await this.mediaDetailsRepository.save(
          this.mediaDetailsRepository.create(mediaDetails),
        )
      : null;

    // Save ConstructionDetails
    const savedConstructionDetails = constructionStatus
      ? await this.constructionDetailsRepository.save(
          this.constructionDetailsRepository.create(constructionStatus),
        )
      : null;

    // Save PropertyType and related Units
    let savedPropertyType = null;
    if (propertyType) {
      const { units, ...propertyTypeData } = propertyType;
      savedPropertyType = await this.propertyTypeRepository.save(
        this.propertyTypeRepository.create(propertyTypeData),
      );

      if (units) {
        for (const unit of units) {
          const { flooringPlans, ...unitData } = unit;

          // Save individual units
          const savedUnit = await this.unitsRepository.save(
            this.unitsRepository.create({
              ...unitData,
              propertyType: savedPropertyType,
            }),
          );

          // Save flooring plans for each unit
          if (flooringPlans && flooringPlans.length > 0) {
            const floorPlanEntities = flooringPlans.map((floorPlan) =>
              this.flooringPlansRepository.create({
                ...floorPlan,
                unit: savedUnit,
              }),
            );
            await this.flooringPlansRepository.save(floorPlanEntities);
          }
        }
      }
    }

    // Save Project with all relations
    const project = this.projectRepository.create({
      ...projectData,
      company,
      location: savedLocation,
      mediaDetails: savedMediaDetails,
      constructionStatus: savedConstructionDetails,
      propertyType: savedPropertyType,
    });

    return this.projectRepository.save(project);
  }

  async updateProject(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: [
        'location',
        'mediaDetails',
        'constructionStatus',
        'propertyType',
        'propertyType.units',
        'propertyType.units.flooringPlans',
        'company',
      ],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const {
      location,
      mediaDetails,
      constructionStatus,
      propertyType,
      company,
      ...projectData
    } = updateProjectDto;

    Object.assign(project, projectData);

    if (location) {
      project.location = await this.locationRepository.save({
        id: project.location?.id,
        ...location,
      });
    }

    if (mediaDetails) {
      const oldMedia = project.mediaDetails;
      const newImages = mediaDetails.propertyImages ?? oldMedia?.propertyImages ?? [];
      const newVideos = mediaDetails.propertyVideo ?? oldMedia?.propertyVideo ?? [];
      const oldImages = oldMedia?.propertyImages ?? [];
      const oldVideos = oldMedia?.propertyVideo ?? [];
      const toDelete = [
        ...oldImages.filter((u: string) => !newImages.includes(u)),
        ...oldVideos.filter((u: string) => !newVideos.includes(u)),
      ].filter(Boolean);
      for (const url of toDelete) {
        try {
          await this.s3Service.deleteFileByUrl(url);
        } catch (err) {
          console.warn('Failed to delete company project media from S3:', err);
        }
      }
      project.mediaDetails = await this.mediaDetailsRepository.save({
        id: project.mediaDetails?.id,
        ...mediaDetails,
      });
    }

    if (constructionStatus) {
      project.constructionStatus =
        await this.constructionDetailsRepository.save({
          id: project.constructionStatus?.id,
          ...constructionStatus,
        });
    }

    if (propertyType) {
      const { units = [], ...propertyTypeData } = propertyType;

      project.propertyType = await this.propertyTypeRepository.save({
        id: project.propertyType?.id,
        ...propertyTypeData,
      });

      const existingUnits = await this.unitsRepository.find({
        where: { propertyType: { id: project.propertyType.id } },
        relations: ['flooringPlans'],
      });

      const payloadUnitIds = units.map((u) => u.id).filter(Boolean);

      for (const existingUnit of existingUnits) {
        if (!payloadUnitIds.includes(existingUnit.id)) {
          if (existingUnit.flooringPlans?.length > 0) {
            await this.flooringPlansRepository.remove(
              existingUnit.flooringPlans,
            );
          }

          await this.unitsRepository.remove(existingUnit);
        }
      }

      for (const unitDto of units) {
        const { flooringPlans = [], ...unitData } = unitDto;

        const savedUnit = await this.unitsRepository.save({
          id: unitDto.id,
          ...unitData,
          propertyType: project.propertyType,
        });

        const existingFloors = await this.flooringPlansRepository.find({
          where: { unit: { id: savedUnit.id } },
        });

        const payloadFloorIds = flooringPlans.map((f) => f.id).filter(Boolean);

        for (const existingFloor of existingFloors) {
          if (!payloadFloorIds.includes(existingFloor.id)) {
            if (existingFloor.mediaUrl) {
              try {
                await this.s3Service.deleteFileByUrl(existingFloor.mediaUrl);
              } catch (err) {
                console.warn('Failed to delete floor plan media from S3:', err);
              }
            }
            for (const url of existingFloor.floorplan ?? []) {
              if (url) {
                try {
                  await this.s3Service.deleteFileByUrl(url);
                } catch (err) {
                  console.warn('Failed to delete floor plan file from S3:', err);
                }
              }
            }
            await this.flooringPlansRepository.remove(existingFloor);
          }
        }

        for (const floorPlanDto of flooringPlans) {
          await this.flooringPlansRepository.save({
            id: floorPlanDto.id,
            ...floorPlanDto,
            unit: savedUnit,
          });
        }
      }
    }

    await this.projectRepository.save(project);

    if (project.company?.developerInformation?.email) {
      const user = project.company.developerInformation;
      const emailTemplate = generateProjectUpdateTemplate({
        name: project.Name,
      });

      await this.notificationService.sendEmailNotification({
        email: user.email,
        template: emailTemplate,
      });

      const message = `Your project "${project.Name}" has been updated.`;
      await this.notificationService.createNotification({
        userId: user.id,
        message,
      });
    }

    return await this.projectRepository.findOne({
      where: { id: projectId },
      relations: [
        'location',
        'mediaDetails',
        'constructionStatus',
        'propertyType',
        'propertyType.units',
        'propertyType.units.flooringPlans',
        'company',
      ],
    });
  }

  //-------------Seller CRUD methods---------------

  // Verify seller email

  async verifySellerEmail(params: VerifySellerEmailDto) {
    const { email, projectId } = params;
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['sellers'],
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const existingSeller = await this.userRepository.findOne({
        where: { email: email },
      });

      if (existingSeller && existingSeller.isVerified) {
        if (existingSeller.kind !== UserKind.SELLER) {
          existingSeller.kind = UserKind.SELLER;
          await this.userRepository.save(existingSeller);
        }

        const isSellerExist = project.sellers.find(
          (seller) => seller.id === existingSeller.id,
        );

        if (!isSellerExist) {
          project.sellers.push(existingSeller);
        }

        await this.projectRepository.save(project);

        return existingSeller;
      } else {
        const response = await this.otpService.sendOtp({ email });
        return response;
      }
    } catch (error) {
      console.log('error in verifySellerEmail', error.message);
      throw error;
    }
  }

  // Verify seller otp

  async verifySellerOtp(params: verifySellerOtpDto) {
    const { email, otp, projectId } = params;
    try {
      const verifiedOtp = await this.otpService.verifyOtp({
        email,
        otp,
      });

      if (!verifiedOtp?.email) {
        return { message: 'Invalid OTP' };
      }

      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['sellers'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const existingSeller = await this.userRepository.findOne({
        where: { email },
      });

      if (existingSeller) {
        existingSeller.isVerified = true;
        existingSeller.kind = UserKind.SELLER;
        await this.userRepository.save(existingSeller);

        const isSellerExist = project.sellers.find(
          (seller) => seller.id === existingSeller.id,
        );

        if (!isSellerExist) {
          project.sellers.push(existingSeller);
        }

        await this.projectRepository.save(project);

        return existingSeller;
      } else {
        const seller = this.userRepository.create({
          email,
          isVerified: true,
          username: `user_${Date.now()}`,
          password: '',
          kind: UserKind.SELLER,
        });

        project.sellers.push(seller);
        await this.projectRepository.save(project);

        return {
          message: 'OTP verified successfully',
        };
      }
    } catch (error) {
      console.log('error in verifySellerOtp', error.message);
      throw error;
    }
  }

  // save seller details

  async saveSellerDetails(params: SaveSellerDetailsDto) {
    const {
      projectId,
      email,
      password,
      firstName,
      lastName,
      phone,
      profilePhoto,
      priceRange,
    } = params;

    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['sellers'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const isSellerExist = project.sellers.find(
        (seller) => seller.email === email,
      );

      if (!isSellerExist) {
        throw new NotFoundException('Seller does not exist in this project');
      }

      const existingSeller = await this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });

      const username = this.generateUsername(email, phone, firstName, lastName);
      const hashedPassword = await bcrypt.hash(password, 10);

      if (existingSeller.isVerified) {
        if (profilePhoto !== undefined && existingSeller.profile && profilePhoto !== existingSeller.profile) {
          try {
            await this.s3Service.deleteFileByUrl(existingSeller.profile);
          } catch (err) {
            console.warn('Failed to delete old seller profile from S3:', err);
          }
        }
        existingSeller.username = username;
        existingSeller.password = hashedPassword;
        existingSeller.firstName = firstName;
        existingSeller.lastName = lastName;
        existingSeller.fullName = `${firstName} ${lastName}`;
        existingSeller.phone = phone;
        existingSeller.profile = profilePhoto;
        existingSeller.priceRange = priceRange;

        const updatedSellers = project?.sellers?.map((seller) => {
          if (seller.id === existingSeller.id) {
            return {
              ...existingSeller,
            };
          }

          return seller;
        });

        project.sellers = updatedSellers;

        await this.projectRepository.save(project);

        return existingSeller;
      } else {
        throw new BadRequestException('Email is not verified.');
      }
    } catch (error) {
      console.log('error in saveSellerDetails', error.message);
      throw error;
    }
  }

  // Update seller details

  async updateSellerDetails(params: updateSellerDetailsDto) {
    const { email, projectId } = params;
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['sellers'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const isSellerExist = project?.sellers?.find(
        (seller) => seller.email === email,
      );

      if (!isSellerExist) {
        throw new NotFoundException('Seller does not exist in this project');
      }

      const updatedData = {};

      if (params?.firstName) {
        updatedData['firstName'] = params.firstName;
      }

      if (params?.lastName) {
        updatedData['lastName'] = params.lastName;
      }

      if (params?.phone) {
        updatedData['phone'] = params.phone;
      }

      if (params?.profilePhoto) {
        updatedData['profile'] = params.profilePhoto;
      }

      if (params?.priceRange) {
        updatedData['priceRange'] = params.priceRange;
      }

      if (params?.firstName && params?.lastName) {
        updatedData['fullName'] = `${params.firstName} ${params.lastName}`;
      }

      const existingSeller = await this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });

      if (params?.profilePhoto && existingSeller.profile && params.profilePhoto !== existingSeller.profile) {
        try {
          await this.s3Service.deleteFileByUrl(existingSeller.profile);
        } catch (err) {
          console.warn('Failed to delete old seller profile from S3:', err);
        }
      }

      const updatedExistingSeller = Object.assign(existingSeller, updatedData);

      const updatedSellers = project?.sellers?.map((seller) => {
        if (seller.id === existingSeller.id) {
          return {
            ...updatedExistingSeller,
          };
        }

        return seller;
      });

      project.sellers = updatedSellers;

      await this.projectRepository.save(project);
    } catch (error) {
      console.log('error in updateSellerDetailsDto', error.message);
      throw error;
    }
  }

  // delete seller

  async deleteSeller(params: DeleteSellerDto) {
    const { email, projectId } = params;
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['sellers'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const isSellerExist = project?.sellers?.find(
        (seller) => seller.email === email,
      );

      if (!isSellerExist) {
        throw new NotFoundException('Seller does not exist in this project');
      }

      const filteredSellers = project?.sellers?.filter(
        (seller) => seller.email !== email,
      );
      project.sellers = filteredSellers;
      await this.projectRepository.save(project);

      return {
        message: `Seller with this  ${email} email removed from the project successfully`,
      };
    } catch (error) {
      console.log('error in deleteSeller', error.message);
      throw error;
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    const companies = await this.companyRepository.find({
      relations: ['developerInformation'],
    });

    if (!companies || companies.length === 0) {
      throw new NotFoundException('No companies found.');
    }

    return companies;
  }

  async getAllProjectsOfCompany(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: [
        'developerInformation',
        'projects',
        'projects.propertyType',
        'projects.propertyType.units',
        'projects.propertyType.units.flooringPlans',
        'projects.location',
        'projects.mediaDetails',
        'projects.constructionStatus',
      ],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found.`);
    }

    if (!company.projects || company.projects.length === 0) {
      throw new NotFoundException(
        `Company with ID ${companyId} has no projects associated.`,
      );
    }

    return company;
  }

  async fetchCompanyDetails(companyId: string): Promise<Company> {
    const companyDetails = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: [
        'developerInformation',
        'projects',
        'projects.propertyType',
        'projects.propertyType.units',
        'projects.propertyType.units.flooringPlans',
        'projects.location',
        'projects.mediaDetails',
        'projects.constructionStatus',
        'projects.sellers',
        'awards',
        'locatedIn',
      ],
    });

    if (!companyDetails) {
      throw new NotFoundException(`Company with ID ${companyId} not found.`);
    }

    return companyDetails;
  }

  async fetchProjectDetails(projectId: string): Promise<Project> {
    const projectDetails = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: [
        'location',
        'mediaDetails',
        'constructionStatus',
        'propertyType',
        'propertyType.units',
        'propertyType.units.flooringPlans',
        'company',
        'sellers',
      ],
    });

    if (!projectDetails) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    return projectDetails;
  }

  private generateUsername(
    email?: string,
    phone?: string,
    firstName?: string,
    lastName?: string,
  ): string {
    try {
      if (firstName && lastName) {
        const username = `${firstName}.${lastName}.${email ? email.slice(0, 5) : phone.slice(-4)}`;
        return username;
      } else {
        const username = email ? email.split('@')[0] : phone.slice(-4);
        return username;
      }
    } catch (error) {
      console.log('Error generating username', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }

  async getAllProjects(filter: ProjectFilterDto): Promise<{
    data: any[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const {
      city,
      locality,
      localityId,
      builderId,
      propertytype,
      bhkType,
      facing,
      priceRange,
      buildupArea,
      amenities,
      constructionStatus,
      ageOfProperty,
      promotionType,

      page = 1,
      limit = 3,
    } = filter;

    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.location', 'location')
      .leftJoinAndSelect('project.propertyType', 'propertyType')
      .leftJoinAndSelect('propertyType.units', 'units')
      .leftJoinAndSelect('units.flooringPlans', 'flooringPlans')
      .leftJoinAndSelect('project.mediaDetails', 'mediaDetails')
      .leftJoinAndSelect('project.constructionStatus', 'constructionStatus')
      .leftJoinAndSelect('project.company', 'company')
      .leftJoinAndSelect('company.developerInformation', 'developer');

    query.where('1=1');

    if (Array.isArray(city) && city.length > 0) {
      query.andWhere(
        `(${city.map((_, i) => `LOWER(location.city) = LOWER(:city${i})`).join(' OR ')})`,
        Object.fromEntries(city.map((c, i) => [`city${i}`, c])),
      );
    }

    if (localityId) {
      query.andWhere('location.id = :localityId', { localityId });
    } else if (Array.isArray(locality) && locality.length > 0) {
      query.andWhere(
        `(${locality.map((_, i) => `LOWER(location.locality) ILIKE :locality${i}`).join(' OR ')})`,
        Object.fromEntries(
          locality.map((l, i) => [`locality${i}`, `%${l.toLowerCase()}%`]),
        ),
      );
    }

    if (builderId) {
      query.andWhere('company.id = :builderId', { builderId });
    }

    if (propertytype?.length) {
      query.andWhere('propertyType.typeName  IN (:...propertytype)', {
        propertytype,
      });
    }

    if (bhkType?.length) {
      query.andWhere('units.BHK IN (:...bhkType)', { bhkType });
    }

    if (facing?.length) {
      query.andWhere('units.facing IN (:...facing)', { facing });
    }

    if (
      Array.isArray(priceRange) &&
      priceRange.length === 2 &&
      !isNaN(Number(priceRange[0])) &&
      !isNaN(Number(priceRange[1]))
    ) {
      const [min, max] = priceRange.map(Number);
      query.andWhere('project.minPrice >= :min AND project.maxPrice <= :max', {
        min,
        max,
      });
    }

    if (
      Array.isArray(buildupArea) &&
      buildupArea.length === 2 &&
      !isNaN(Number(buildupArea[0])) &&
      !isNaN(Number(buildupArea[1]))
    ) {
      const [minSize, maxSize] = buildupArea.map(Number);
      query.andWhere(
        '(flooringPlans."BuiltupArea"->>\'size\')::float BETWEEN :minSize AND :maxSize',
        { minSize, maxSize },
      );
    }

    if (amenities?.length) {
      amenities.forEach((amenity, index) => {
        query.andWhere(`project.ProjectAmenities LIKE :amenity${index}`, {
          [`amenity${index}`]: `%${amenity}%`,
        });
      });
    }

    if (constructionStatus?.length) {
      query.andWhere('constructionStatus.status IN (:...constructionStatus)', {
        constructionStatus,
      });
    }
    if (promotionType?.length) {
      promotionType.forEach((type, index) => {
        query.andWhere(`:type${index} = ANY(project."promotionType")`, {
          [`type${index}`]: type,
        });
      });
    }

    if (ageOfProperty?.length) {
      const currentYear = new Date().getFullYear();
      ageOfProperty.forEach((range, index) => {
        if (range.includes('+')) {
          const minAge = parseInt(range.replace('+ years', '').trim(), 10);
          const maxAge = 100; // Assume upper bound
          const minYear = currentYear - maxAge;
          const maxYear = currentYear - minAge;
          query.andWhere(
            `company.estdYear BETWEEN :minYear${index} AND :maxYear${index}`,
            {
              [`minYear${index}`]: minYear,
              [`maxYear${index}`]: maxYear,
            },
          );
        } else {
          const [minAge, maxAge] = range
            .replace(' years', '')
            .split('-')
            .map(Number);
          const minYear = currentYear - maxAge;
          const maxYear = currentYear - minAge;
          query.andWhere(
            `company.estdYear BETWEEN :minYear${index} AND :maxYear${index}`,
            {
              [`minYear${index}`]: minYear,
              [`maxYear${index}`]: maxYear,
            },
          );
        }
      });
    }

    query.skip((page - 1) * limit).take(limit);

    const [projects, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const formattedProjects = projects.map((project) => {
      const { company, location, propertyType, mediaDetails } = project;

      return {
        id: project.id,
        name: project.Name,

        description: project.Description,
        isBrokerage: project?.isBrokerage ?? false,

        minPrice: project.minPrice,
        maxPrice: project.maxPrice,
        size: project.ProjectSize,
        minSize: project.MinSize,
        maxSize: project.MaxSize,
        location,
        mediaDetails,
        constructionStatus: project?.constructionStatus,
        propertyType: propertyType?.typeName,
        units: project?.propertyType?.units,
        amenities: project.ProjectAmenities,
        promotionType: project.promotionType,
        ProjectAmenities: project?.ProjectAmenities,
        promotionTags: project?.promotionTags,
        approvedBy: project?.approvedBy,
        company: {
          id: company?.id,
          name: company?.companyName,
          logo: company?.Logo,
          about: company?.about,
          RERAId: company?.RERAId,
          estdYear: company?.estdYear,
          developer: company?.developerInformation?.fullName || null,
        },
      };
    });

    return {
      data: formattedProjects,
      total,
      currentPage: page,
      totalPages,
    };
  }

  async updatePromotionType(
    projectId: string,
    promotionType: PromotionTypeEnum[],
    promotionExpiry?: Date,
    approvedBy?: string,
    updatedBy?: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    project.promotionType = promotionType;
    project.promotionExpiry = promotionExpiry ?? null;
    project.approvedBy = approvedBy ?? '';
    project.updatedBy = updatedBy ?? '';

    return await this.projectRepository.save(project);
  }
  async deleteCompany(companyId: string): Promise<{ message: string }> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['projects', 'projects.sellers'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found.`);
    } 

    for (const project of company.projects) {
      if (project.sellers && project.sellers.length) {
        await this.userRepository.remove(project.sellers);
      }
    }

    await this.projectRepository.remove(company.projects);

    await this.companyRepository.remove(company);

    return {
      message:
        'Company and all associated projects and sellers deleted successfully',
    };
  }

  /** Projects whose name matches the search */
  async searchProjects(
    search: string,
    city?: string,
    lookingTypes: string[] = [],
  ) {
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.location', 'location')
      .where('project.isPosted = :isPosted', { isPosted: true })
      .andWhere('project.isApproved = :isApproved', { isApproved: true })
      .andWhere('project.Name ILIKE :search', { search: `%${search}%` });

    if (city) {
      query.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }

    return query.limit(10).getMany();
  }

  /** Projects whose location matches the search (locality, city, subLocality, area, landmark, zone, street) */
  async searchProjectsByLocality(search: string, city?: string) {
    const searchTerm = `%${search}%`;
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.location', 'location')
      .leftJoinAndSelect('project.company', 'company')
      .where('project.isPosted = :isPosted', { isPosted: true })
      .andWhere('project.isApproved = :isApproved', { isApproved: true })
      .andWhere(
        '(location.locality ILIKE :search OR location.city ILIKE :search OR location.subLocality ILIKE :search OR location.area ILIKE :search OR location.landmark ILIKE :search OR location.zone ILIKE :search OR location.street ILIKE :search)',
        { search: searchTerm },
      );

    if (city) {
      query.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }
    return query.limit(10).getMany();
  }

  /** Builders whose company name matches the search */
  async searchBuilders(search: string) {
    return this.companyRepository
      .createQueryBuilder('company')
      .where('company.companyName ILIKE :search', { search: `%${search}%` })
      .limit(10)
      .getMany();
  }

  /** Builders (companies) that have projects in a location matching the search (all location fields) */
  async searchBuildersByLocality(search: string, city?: string) {
    const searchTerm = `%${search}%`;
    const query = this.companyRepository
      .createQueryBuilder('company')
      .innerJoin('company.projects', 'project')
      .innerJoin('project.location', 'location')
      .where('project.isPosted = :isPosted', { isPosted: true })
      .andWhere('project.isApproved = :isApproved', { isApproved: true })
      .andWhere(
        '(location.locality ILIKE :search OR location.city ILIKE :search OR location.subLocality ILIKE :search OR location.area ILIKE :search OR location.landmark ILIKE :search OR location.zone ILIKE :search OR location.street ILIKE :search)',
        { search: searchTerm },
      );

    if (city) {
      query.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }
    return query.distinct(true).limit(10).getMany();
  }

  //find project by slug

  async findProjectBySlug(slug: string, city: string) {
    const cleaned = slug.trim().toLowerCase().replace(/-/g, ' ');
    return await this.projectRepository.findOne({
      where: {
        Name: ILike(`%${cleaned}%`),
        location: {
          city: ILike(`%${city}%`),
        },
      },
      relations: ['location'],
    });
  }

  //getcitywise Project Count

  async getCityWiseProjectCounts() {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.location', 'location')
      .where('location.city IS NOT NULL')
      .select('LOWER(location.city)', 'city')
      .addSelect('COUNT(project.id)', 'count')
      .groupBy('LOWER(location.city)')
      .getRawMany();
  }

  async updateCompanyPromotion(
    id: string,
    promotionType: string[],
    promotionExpiry?: Date,
    updatedBy?: string,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');

    company.promotionType = promotionType;
    company.promotionExpiry = promotionExpiry ?? null;
    company.promotionTags = promotionType.map((p) => p.toLowerCase());
    company.updatedBy = updatedBy ?? '';

    return await this.companyRepository.save(company);
  }
  //get all popular Builders

  async getPopularBuilders(city: string): Promise<PopularBuilderDto[]> {
    const companies = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.locatedIn', 'address')
      .leftJoinAndSelect('company.projects', 'projects')
      .where('LOWER(address.city) = :city', { city: city.toLowerCase() })
      .andWhere('"company"."promotionType" IS NOT NULL')
      .andWhere(':type = ANY("company"."promotionType")', { type: 'Popular' })
      .getMany();

    return companies.map((company) => {
      const logo =
        Array.isArray(company.Logo) && company.Logo.length > 0
          ? company.Logo[0]
          : null;
      const slug = company.companyName.toLowerCase().replace(/\s+/g, '-');

      const projectsInCity = company.projects.filter(
        (p) => p.location?.city?.toLowerCase() === city.toLowerCase(),
      ).length;

      return {
        id: company.id,
        slug,
        companyName: company.companyName,
        logo,
        totalProjects: company.projects.length,
        projectsInCity,
      };
    });
  }

  async getPopularLocalities(city: string): Promise<
    {
      locality: string;
      id: string;
      name: string;
      city: string;
      zone?: string;
      totalProjects: number;
      minPrice: number;
      maxPrice: number;
      minSize: number;
      maxSize: number;
    }[]
  > {
    const result = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.location', 'location')
      .where('LOWER(location.city) = :city', { city: city.toLowerCase() })
      .andWhere('project.promotionType IS NOT NULL')
      .andWhere(':tag = ANY(project.promotionType)', { tag: 'Premium' })
      .select([
        'location.locality AS locality',
        'location.city AS city',
        'location.zone AS zone',
        'MIN(project."Name") AS name',
        'MIN(project.id::text) AS id',
        'COUNT(project.id) AS "totalProjects"',
        'MIN(project.minPrice) AS "minPrice"',
        'MAX(project.maxPrice) AS "maxPrice"',
        'MIN(project."MinSize"::jsonb ->> \'size\')::int AS "minSize"',
        'MAX(project."MaxSize"::jsonb ->> \'size\')::int AS "maxSize"',
      ])
      .groupBy('location.locality, location.city, location.zone')
      .orderBy('"totalProjects"', 'DESC')
      .limit(6)
      .getRawMany();

    return result.map((item) => ({
      ...item,
        id: String(item.id),

      minPrice: Number(item.minPrice),
      maxPrice: Number(item.maxPrice),
      minSize: Number(item.minSize),
      maxSize: Number(item.maxSize),
      totalProjects: Number(item.totalProjects),
    }));
  }

  // Get company status counts for admin dashboard
  async getCompanyStatusCounts(): Promise<{
    all: number;
    pending: number;
    approved: number;
    draft: number;
  }> {
    try {
      const all = await this.companyRepository.count();
      const pending = await this.companyRepository.count({
        where: { isPosted: true, isApproved: false },
      });
      const approved = await this.companyRepository.count({
        where: { isApproved: true },
      });
      const draft = await this.companyRepository.count({
        where: { isPosted: false },
      });
      return { all, pending, approved, draft };
    } catch (error) {
      console.error('Error fetching company status counts:', error);
      return { all: 0, pending: 0, approved: 0, draft: 0 };
    }
  }

  // Get all companies with filters for admin
  async adminGetAllCompaniesWithFilters(
    page: number,
    limit: number,
    status: 'all' | 'pending' | 'approved' | 'draft',
    search?: string,
  ): Promise<{
    data: Company[];
    total: number;
    currentPage: number;
    totalPages: number;
    counts: { all: number; pending: number; approved: number; draft: number };
  }> {
    try {
      const queryBuilder = this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.developerInformation', 'developer')
        .leftJoinAndSelect('company.projects', 'projects')
        .leftJoinAndSelect('company.locatedIn', 'address');

      // Apply status filter
      if (status === 'pending') {
        queryBuilder.andWhere('company.isPosted = :isPosted AND company.isApproved = :isApproved', {
          isPosted: true,
          isApproved: false,
        });
      } else if (status === 'approved') {
        queryBuilder.andWhere('company.isApproved = :isApproved', { isApproved: true });
      } else if (status === 'draft') {
        queryBuilder.andWhere('company.isPosted = :isPosted', { isPosted: false });
      }

      // Apply search filter
      if (search) {
        queryBuilder.andWhere(
          '(LOWER(company.companyName) LIKE :search OR LOWER(developer.fullName) LIKE :search)',
          { search: `%${search.toLowerCase()}%` },
        );
      }

      queryBuilder.orderBy('company.createdAt', 'DESC');

      const total = await queryBuilder.getCount();
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const data = await queryBuilder.getMany();
      const counts = await this.getCompanyStatusCounts();

      return {
        data,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        counts,
      };
    } catch (error) {
      console.error('Error fetching admin companies:', error);
      return {
        data: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        counts: { all: 0, pending: 0, approved: 0, draft: 0 },
      };
    }
  }

  // Approve or reject a company
  async approveCompany(
    companyId: string,
    isApproved: boolean,
    approvedBy: string,
    isPosted?: boolean,
    rejectionReason?: string,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['developerInformation'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found.`);
    }

    company.isApproved = isApproved;
    company.approvedBy = approvedBy;
    company.approvedDate = new Date();
    company.updatedBy = approvedBy;

    if (isPosted !== undefined) {
      company.isPosted = isPosted;
    }

    const savedCompany = await this.companyRepository.save(company);

    // Send notification
    if (company.developerInformation) {
      const message = isApproved
        ? `Great news! ${company.companyName} has been approved and is now live on Houznext.`
        : `${company.companyName} was not approved. ${rejectionReason || 'Please contact support.'}`;

      try {
        await this.notificationService.createNotification({
          userId: company.developerInformation.id,
          message,
        });
      } catch (e) {
        console.error('Failed to send notification:', e);
      }
    }

    return savedCompany;
  }

  // Approve or reject a project
  async approveProject(
    projectId: string,
    isApproved: boolean,
    approvedBy: string,
    isPosted?: boolean,
    rejectionReason?: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['company', 'company.developerInformation'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    project.isApproved = isApproved;
    project.approvedBy = approvedBy;
    project.approvedDate = new Date();
    project.updatedBy = approvedBy;

    if (isPosted !== undefined) {
      project.isPosted = isPosted;
    }

    const savedProject = await this.projectRepository.save(project);

    // Send notification
    if (project.company?.developerInformation) {
      const message = isApproved
        ? `Great news! ${project.Name} has been approved and is now live on Houznext.`
        : `${project.Name} was not approved. ${rejectionReason || 'Please contact support.'}`;

      try {
        await this.notificationService.createNotification({
          userId: project.company.developerInformation.id,
          message,
        });
      } catch (e) {
        console.error('Failed to send notification:', e);
      }
    }

    return savedProject;
  }
 async deleteProject(projectId: string): Promise<{ message: string }> {
  const project = await this.projectRepository.findOne({
    where: { id: projectId },
    relations: [
      'location',
      'mediaDetails',
      'constructionStatus',
      'propertyType',
      'propertyType.units',
      'propertyType.units.flooringPlans',
      'sellers',
    ],
  });

  if (!project) throw new NotFoundException('Project not found');

  const propertyType = project.propertyType;
  const units = propertyType?.units ?? [];
  const location = project.location;
  const media = project.mediaDetails;
  const construction = project.constructionStatus;

  // Delete all project files from S3 before removing DB records
  if (media) {
    const urls = [
      ...(media.propertyImages ?? []),
      ...(media.propertyVideo ?? []),
    ].filter(Boolean);
    for (const url of urls) {
      try {
        await this.s3Service.deleteFileByUrl(url);
      } catch (err) {
        console.warn('Failed to delete project media from S3:', err);
      }
    }
  }
  for (const unit of units) {
    for (const fp of unit.flooringPlans ?? []) {
      if (fp.mediaUrl) {
        try {
          await this.s3Service.deleteFileByUrl(fp.mediaUrl);
        } catch (err) {
          console.warn('Failed to delete floor plan media from S3:', err);
        }
      }
      for (const url of fp.floorplan ?? []) {
        if (url) {
          try {
            await this.s3Service.deleteFileByUrl(url);
          } catch (err) {
            console.warn('Failed to delete floor plan file from S3:', err);
          }
        }
      }
    }
  }

  // 1) clear M2M sellers relation (do NOT delete user rows)
  if (project.sellers?.length) {
    project.sellers = [];
    await this.projectRepository.save(project);
  }

  // ✅ 2) delete project FIRST (removes FK to property_type)
  await this.projectRepository.remove(project);

  // 3) delete flooring plans
  for (const unit of units) {
    if (unit.flooringPlans?.length) {
      await this.flooringPlansRepository.remove(unit.flooringPlans);
    }
  }

  // 4) delete units
  if (units.length) await this.unitsRepository.remove(units);

  // 5) delete propertyType
  if (propertyType) await this.propertyTypeRepository.remove(propertyType);

  // 6) delete dependent single tables
  if (location) await this.locationRepository.remove(location);
  if (media) await this.mediaDetailsRepository.remove(media);
  if (construction) await this.constructionDetailsRepository.remove(construction);

  return { message: 'Project deleted successfully' };
}


}
