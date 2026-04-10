
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { OtpService } from 'src/otp/otp.service';
import { UserService } from 'src/user/user.service';
import {
  CustomerDetailsDto,
  UpdateCustomerDetails,
  VerifyCustomerOtpDto,
  VerifyEmailDto,
} from './dto/customer.dto';
import * as bcrypt from 'bcrypt';
import { ServiceType } from '../service-required/enum/cb-service.enum';
import { PropertyType } from '../custom-property/enum/custom-property.enum';
import { PurposeType } from 'src/property/enums/property.enum';
import { NotificationService } from 'src/notifications/notification.service';
import { MembershipService } from 'src/branch/membership.service';
import { Branch } from 'src/branch/entities/branch.entity';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { UserKind } from 'src/user/enum/user.enum';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { CurrentStep } from '../enum/custom-builder.enum';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,

    @InjectRepository(BranchRole)
    private readonly branchRoleRepo: Repository<BranchRole>,

    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepo: Repository<CustomBuilder>,

    private readonly otpService: OtpService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly notificationService: NotificationService,

    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
  ) {}

  // STEP 1: send OTP to email or phone
  async verifyEmail({ email, phone }: VerifyEmailDto): Promise<any> {
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    if (phone) {
      const existingPhoneUser = await this.userRepository.findOne({
        where: { phone },
      });
      if (existingPhoneUser?.isVerified) {
        return {
          type: 'phone',
          status: 'already_verified',
          message: 'Phone number is already verified',
          phone,
        };
      }
      const resp = await this.otpService.sendOtp({ phone });
      return {
        type: 'phone',
        status: 'otp_sent',
        message: 'OTP sent successfully via SMS',
        phone,
        response: resp,
      };
    }

    if (email) {
      const existingEmailUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingEmailUser?.isVerified) {
        return {
          type: 'email',
          status: 'already_verified',
          message: 'Email is already verified',
          email,
        };
      }
      const resp = await this.otpService.sendOtp({ email });
      return {
        type: 'email',
        status: 'otp_sent',
        message: 'OTP sent successfully via Email',
        email,
        response: resp,
      };
    }
  }

  // STEP 2: verify OTP and mark/create CUSTOMER
  async verifyOtp({ email, otp, phone }: VerifyCustomerOtpDto): Promise<any> {
    if (!email && !phone) {
      throw new BadRequestException(
        'Either email or phone must be provided for OTP verification',
      );
    }

    const verified = await this.otpService.verifyOtp({ email, phone, otp });
    if (!verified?.email && !verified?.phone) {
      return { message: 'Invalid OTP' };
    }

    const where = email ? { email } : { phone };
    let user = await this.userRepository.findOne({ where });

    if (user) {
      user.isVerified = true;
      user.kind = UserKind.CUSTOMER;
      await this.userRepository.save(user);

      return {
        message: 'Existing user verified as CUSTOMER',
        user,
      };
    }

    user = this.userRepository.create({
      email: email || null,
      phone: phone || null,
      isVerified: true,
      username: `user_${Date.now()}`,
      password: '',
      kind: UserKind.CUSTOMER,
    });
    await this.userRepository.save(user);

    return {
      message: 'New CUSTOMER user created',
      user,
    };
  }

  // STEP 3: complete profile & (optionally) attach Branch + CustomBuilder
  // async saveCustomerDetails(
  //   customerDetails: CustomerDetailsDto,
  //   createdById: number,
  // ): Promise<any> {
  //   const {
  //     email,
  //     phone,
  //     firstName,
  //     lastName,
  //     password,
  //     branchId,
  //     assignCustomerBranchRole,
  //     createCustomBuilder,
  //   } = customerDetails;

  //   if (!email && !phone) {
  //     throw new BadRequestException('Email or phone must be provided.');
  //   }

  //   const userByEmail = email
  //     ? await this.userRepository.findOne({ where: { email } })
  //     : null;
  //   const userByPhone = phone
  //     ? await this.userRepository.findOne({ where: { phone } })
  //     : null;

  //   const existingUser = userByEmail?.isVerified
  //     ? userByEmail
  //     : userByPhone?.isVerified
  //     ? userByPhone
  //     : null;

  //   if (!existingUser) {
  //     throw new NotFoundException(
  //       'User not found or not verified. Please verify first.',
  //     );
  //   }

  //   const username = this.generateUsername(
  //     existingUser.email || email,
  //     existingUser.phone || phone,
  //     firstName,
  //     lastName,
  //   );

  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   existingUser.username = username;
  //   existingUser.firstName = firstName;
  //   existingUser.lastName = lastName;
  //   existingUser.fullName = `${firstName} ${lastName}`;
  //   existingUser.kind = UserKind.CUSTOMER;

  //   if (email && !existingUser.email) existingUser.email = email;
  //   if (phone && !existingUser.phone) existingUser.phone = phone;

  //   existingUser.password = hashedPassword;

  //   if (createdById) {
  //     const admin = await this.userRepository.findOne({
  //       where: { id: createdById },
  //     });
  //     existingUser.createdById = admin ? createdById : null;
  //   }

  //   await this.userRepository.save(existingUser);

  //   // Branch membership
  //   if (branchId && (assignCustomerBranchRole ?? true)) {
  //     const branch = await this.branchRepo.findOne({ where: { id: branchId } });
  //     if (!branch) throw new NotFoundException('Branch not found');

  //     const customerRole = await this.branchRoleRepo.findOne({
  //       where: { roleName: 'CUSTOMER', branch: { id: branchId } },
  //       relations: ['branch'],
  //     });

  //     await this.membershipService.assign({
  //       userId: existingUser.id,
  //       branchId: branch.id,
  //       branchRoleIds: customerRole ? [customerRole.id] : [],
  //       isPrimary: true,
  //       isBranchHead: false,
  //     });
  //   }

  //   // Create / attach CustomBuilder
  //   if (createCustomBuilder) {
  //     const existingCb = await this.customBuilderRepo.findOne({
  //       where: { customer: { id: existingUser.id } },
  //       relations: ['customer', 'branch', 'createdByUser'],
  //     });

  //     const branch = branchId
  //       ? await this.branchRepo.findOne({ where: { id: branchId } })
  //       : null;

  //     const admin =
  //       createdById &&
  //       (await this.userRepository.findOne({ where: { id: createdById } }));

  //     if (!existingCb) {
  //       const customBuilder = this.customBuilderRepo.create({
  //         customer: existingUser,              // ✅ links as CUSTOMER
  //         customerId: existingUser.id,
  //         branch: branch ?? null,
  //         branchId: branch ? branch.id : null,
  //         createdByUser: admin ?? null,        // admin/staff
  //         createdByUserId: admin ? admin.id : null,
  //         currentStep: CurrentStep.customerOnboarding,
  //         currentDay: 0,
  //         onboardingSteps: 0,
  //       });

  //       await this.customBuilderRepo.save(customBuilder);
  //     } else {
  //       existingCb.customer = existingUser;
  //       existingCb.customerId = existingUser.id;
  //       if (branch) {
  //         existingCb.branch = branch;
  //         existingCb.branchId = branch.id;
  //       }
  //       if (admin) {
  //         existingCb.createdByUser = admin;
  //         existingCb.createdByUserId = admin.id;
  //       }
  //       await this.customBuilderRepo.save(existingCb);
  //     }
  //   }

  //   // Notify customer
  //   const message = `Hi ${existingUser.fullName}, your customer account has been successfully created!`;
  //   await this.notificationService.createNotification({
  //     userId: existingUser.id,
  //     message,
  //   });

  //   if (existingUser.email) {
  //     await this.notificationService.sendEmailNotification({
  //       email: existingUser.email,
  //       template: `
  //         <div style="font-family: Arial, sans-serif; font-size: 14px;">
  //           <p>Dear ${existingUser.fullName},</p>
  //           <p>Your customer account has been successfully created on Houznext.</p>
  //           <p>Welcome aboard!</p>
  //           <br/>
  //           <p>Thank you,<br/>Houznext Team</p>
  //         </div>
  //       `,
  //     });
  //   }

  //   return this.userRepository.findOne({
  //     where: { id: existingUser.id },
  //     relations: [
  //       'branchMemberships',
  //       'branchMemberships.branch',
  //      'branchMemberships.branchRoles',

  //       'customBuilders',
  //       'customBuilders.branch',
  //     ],
  //   });
  // }
 async saveCustomerDetails(
  customerDetails: CustomerDetailsDto,
  createdById: string,
): Promise<any> {
  const {
    email,
    phone,
    firstName,
    lastName,
    password,
    branchId,
    assignCustomerBranchRole,
    createCustomBuilder,
  } = customerDetails;

  // 1) Safety: must have email or phone
  if (!email && !phone) {
    throw new BadRequestException('Email or phone must be provided.');
  }

  // 2) Find the verified skeleton user from OTP step
  const userByEmail = email
    ? await this.userRepository.findOne({ where: { email } })
    : null;
  const userByPhone = phone
    ? await this.userRepository.findOne({ where: { phone } })
    : null;

  const existingUser = userByEmail?.isVerified
    ? userByEmail
    : userByPhone?.isVerified
    ? userByPhone
    : null;

  if (!existingUser) {
    throw new NotFoundException(
      'User not found or not verified. Please verify first.',
    );
  }


  const username = this.generateUsername(
    existingUser.email || email,
    existingUser.phone || phone,
    firstName,
    lastName,
  );

  const hashedPassword = await bcrypt.hash(password, 10);

  existingUser.username = username;
  existingUser.firstName = firstName;
  existingUser.lastName = lastName;
  existingUser.fullName = `${firstName} ${lastName}`;
  existingUser.kind = UserKind.CUSTOMER;

  if (email && !existingUser.email) existingUser.email = email;
  if (phone && !existingUser.phone) existingUser.phone = phone;

  existingUser.password = hashedPassword;

  
  if (createdById) {
    const admin = await this.userRepository.findOne({
      where: { id: createdById },
    });
    existingUser.createdById = admin ? createdById : null;
  }

  await this.userRepository.save(existingUser);

 
  if (branchId && (assignCustomerBranchRole ?? true)) {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const customerRole = await this.branchRoleRepo.findOne({
      where: { roleName: 'CUSTOMER', branch: { id: branchId } },
      relations: ['branch'],
    });

    try {
      await this.membershipService.assign({
        userId: existingUser.id,
        branchId: branch.id,
        branchRoleIds: customerRole ? [customerRole.id] : [],
        isPrimary: true,
        isBranchHead: false,
      });
    } catch (error) {
     
      if (
      
        (error as any).code === '23505'
      ) {
        
      } else {
        throw error;
      }
    }
  }

 
  if (createCustomBuilder) {
    const existingCb = await this.customBuilderRepo.findOne({
      where: { customer: { id: existingUser.id } },
      relations: ['customer', 'branch', 'createdByUser'],
    });

    const branch = branchId
      ? await this.branchRepo.findOne({ where: { id: branchId } })
      : null;

    const admin =
      createdById &&
      (await this.userRepository.findOne({ where: { id: createdById } }));

    if (!existingCb) {
     
      const customBuilder = this.customBuilderRepo.create({
        customer: existingUser,
        customerId: existingUser.id,
        branch: branch ?? null,
        branchId: branch ? branch.id : null,
        createdByUser: admin ?? null,
        createdByUserId: admin ? admin.id : null,
        currentStep: CurrentStep.customerOnboarding,
        currentDay: 0,
        onboardingSteps: 0,
      });

      await this.customBuilderRepo.save(customBuilder);
    } else {
     
      existingCb.customer = existingUser;
      existingCb.customerId = existingUser.id;

      if (branch) {
        existingCb.branch = branch;
        existingCb.branchId = branch.id;
      }
      if (admin) {
        existingCb.createdByUser = admin;
        existingCb.createdByUserId = admin.id;
      }

      await this.customBuilderRepo.save(existingCb);
    }
  }

  // 7) Notify customer
  const message = `Hi ${existingUser.fullName}, your customer account has been successfully created!`;
  await this.notificationService.createNotification({
    userId: existingUser.id,
    message,
  });

  if (existingUser.email) {
    await this.notificationService.sendEmailNotification({
      email: existingUser.email,
      template: `
        <div style="font-family: Arial, sans-serif; font-size: 14px;">
          <p>Dear ${existingUser.fullName},</p>
          <p>Your customer account has been successfully created on Houznext.</p>
          <p>Welcome aboard!</p>
          <br/>
          <p>Thank you,<br/>Houznext Team</p>
        </div>
      `,
    });
  }

  
  return this.userRepository.findOne({
    where: { id: existingUser.id },
    relations: [
      'branchMemberships',
      'branchMemberships.branch',
      'branchMemberships.branchRoles',
      'customBuilders',
      'customBuilders.branch',
    ],
  });
}


  
  async findAllCustomers(
    name?: string,
    locality?: string,
    state?: string,
    city?: string,
    serviceType?: ServiceType,
    propertyType?: PropertyType,
    constructionType?: PurposeType,
    page: number = 1,
    limit: number = 10,
  ) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.locations', 'locations')
      .leftJoinAndSelect('user.customBuilders', 'customBuilders')
      .leftJoinAndSelect('customBuilders.servicesRequired', 'servicesRequired')
      .leftJoinAndSelect(
        'customBuilders.propertyInformation',
        'propertyInformation',
      )
      .where('user.kind = :kind', { kind: UserKind.CUSTOMER });

    if (name) qb.andWhere('user.fullName LIKE :name', { name: `%${name}%` });
    if (city) qb.andWhere('locations.city = :city', { city });
    if (locality) qb.andWhere('locations.locality = :locality', { locality });
    if (state) qb.andWhere('locations.state = :state', { state });

    if (serviceType)
      qb.andWhere('servicesRequired.serviceType = :serviceType', {
        serviceType,
      });
    if (propertyType)
      qb.andWhere('propertyInformation.property_type = :propertyType', {
        propertyType,
      });
    if (constructionType)
      qb.andWhere('propertyInformation.construction_type = :constructionType', {
        constructionType,
      });

    const [customers, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data: customers, total, page, limit };
  }

  async updateCustomerDetails(
    updatecustomerDetails: UpdateCustomerDetails,
  ): Promise<any> {
    const { email, firstName, lastName } = updatecustomerDetails;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (!existingUser?.isVerified) {
      throw new BadRequestException('Email is not verified.');
    }
    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.fullName = `${firstName} ${lastName}`;
    await this.userRepository.save(existingUser);
    return { message: 'Updated' };
  }

  async findOneCustomer(email: string) {
    return this.userRepository.findOne({
      where: { email, kind: UserKind.CUSTOMER },
      relations: ['customBuilders', 'locations', 'customBuilders.branch'],
    });
  }

  async removeCustomer(id: string) {
    await this.userService.remove(id);
    return { message: `User ${id} removed` };
  }

  async getCustomerDetailsById(id: string): Promise<any> {
    const customer = await this.userRepository.findOne({
      where: { id, kind: UserKind.CUSTOMER },
      relations: ['customBuilders', 'customBuilders.branch', 'locations'],
    });
    if (!customer) throw new BadRequestException('Customer not found');
    return customer;
  }

  private generateUsername(
    email?: string,
    phone?: string,
    firstName?: string,
    lastName?: string,
  ): string {
    if (firstName && lastName) {
      return `${firstName}.${lastName}.${
        email ? email.slice(0, 5) : (phone ?? '').slice(-4)
      }`.toLowerCase();
    }
    return (email ? email.split('@')[0] : (phone ?? '').slice(-4)).toLowerCase();
  }
}

