import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from './entities/customer.entity';
import { Rep } from './entities/rep.entity';
import { InteriorProject } from './entities/interior-project.entity';
import { ProjectTrade } from './entities/project-trade.entity';
import { DailyUpdate } from './entities/daily-update.entity';
import { LabourEntry } from './entities/labour-entry.entity';
import { MaterialUsage } from './entities/material-usage.entity';
import { QcItem } from './entities/qc-item.entity';
import { SnagItem } from './entities/snag-item.entity';
import { TradeMedia } from './entities/trade-media.entity';
import { DesignUpload } from './entities/design-upload.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { DailyProgressReport } from './entities/daily-progress-report.entity';
import { ReferralLead } from './entities/referral-lead.entity';
import { PaymentMilestone } from './entities/payment-milestone.entity';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateProjectDto,
  UpdateTradeDto,
  AddTradeToProjectDto,
  AddDailyUpdateDto,
  AddDesignDto,
  AddDocumentDto,
  AddMediaDto,
  UpdateQcItemDto,
  CreateSnagDto,
  ResolveSnagDto,
  UpdateMilestoneDto,
  CreateReferralDto,
  UpdatePortfolioDto,
} from './dto';
import { subDays, startOfDay, parseISO } from 'date-fns';
import { CustomerIdentityService } from '../common/customer-identity/customer-identity.service';
import { normalizePortalMobile } from '../common/phone.util';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

@Injectable()
export class InteriorService {
  constructor(
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Rep) private readonly repRepo: Repository<Rep>,
    @InjectRepository(InteriorProject) private readonly projectRepo: Repository<InteriorProject>,
    @InjectRepository(ProjectTrade) private readonly projectTradeRepo: Repository<ProjectTrade>,
    @InjectRepository(DailyUpdate) private readonly dailyUpdateRepo: Repository<DailyUpdate>,
    @InjectRepository(LabourEntry) private readonly labourEntryRepo: Repository<LabourEntry>,
    @InjectRepository(MaterialUsage) private readonly materialUsageRepo: Repository<MaterialUsage>,
    @InjectRepository(QcItem) private readonly qcItemRepo: Repository<QcItem>,
    @InjectRepository(SnagItem) private readonly snagItemRepo: Repository<SnagItem>,
    @InjectRepository(TradeMedia) private readonly tradeMediaRepo: Repository<TradeMedia>,
    @InjectRepository(DesignUpload) private readonly designUploadRepo: Repository<DesignUpload>,
    @InjectRepository(ProjectDocument) private readonly documentRepo: Repository<ProjectDocument>,
    @InjectRepository(DailyProgressReport) private readonly dprRepo: Repository<DailyProgressReport>,
    @InjectRepository(ReferralLead) private readonly referralLeadRepo: Repository<ReferralLead>,
    @InjectRepository(PaymentMilestone) private readonly milestoneRepo: Repository<PaymentMilestone>,
    private readonly jwtService: JwtService,
    private readonly customerIdentity: CustomerIdentityService,
  ) {}

  private signCustomerToken(customer: Customer): string {
    return this.jwtService.sign(
      {
        sub: customer.id,
        mobile: customer.mobile ?? undefined,
        email: customer.email ?? undefined,
        role: 'customer',
      },
      { expiresIn: '30d' },
    );
  }

  private async customerLoginPayload(customer: Customer) {
    const token = this.signCustomerToken(customer);
    let storeUserId: string | undefined;
    try {
      const storeUser = await this.customerIdentity.ensureStoreUserForPortalCustomer(
        customer.id,
      );
      storeUserId = storeUser.id;
    } catch {
      storeUserId = undefined;
    }
    return { token, customer, storeUserId };
  }

  async resolveStoreUserId(portalCustomerId: string): Promise<string | undefined> {
    try {
      const user = await this.customerIdentity.ensureStoreUserForPortalCustomer(
        portalCustomerId,
      );
      return user.id;
    } catch {
      return undefined;
    }
  }

  private normalizeCustomerEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private displayNameFromEmailLocalPart(email: string): string {
    const local = email.split('@')[0]?.trim() || 'Customer';
    const spaced = local.replace(/[._-]+/g, ' ').trim();
    return spaced || 'Customer';
  }

  async registerCustomerWithEmail(
    emailRaw: string,
    password: string,
  ): Promise<{ token: string; customer: Customer }> {
    const email = this.normalizeCustomerEmail(emailRaw);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Invalid email address');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const existing = await this.customerRepo.findOne({ where: { email } });
    if (existing) {
      if (!existing.passwordHash) {
        throw new ConflictException(
          'This email is already registered. Continue with Google.',
        );
      }
      throw new ConflictException(
        'An account with this email already exists. Please log in.',
      );
    }
    const fullName = this.displayNameFromEmailLocalPart(email);
    const hash = await bcrypt.hash(password, 10);
    const customer = this.customerRepo.create({
      fullName,
      email,
      mobile: null,
      passwordHash: hash,
      isVerified: true,
    });
    const saved = await this.customerRepo.save(customer);
    return this.customerLoginPayload(saved);
  }

  async loginCustomerWithEmail(
    emailRaw: string,
    password: string,
  ): Promise<{ token: string; customer: Customer; storeUserId?: string }> {
    const email = this.normalizeCustomerEmail(emailRaw);
    const customer = await this.customerRepo.findOne({ where: { email } });
    if (!customer) {
      throw new NotFoundException('NO_ACCOUNT');
    }
    if (!customer.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google or mobile OTP. Use that method to sign in.',
      );
    }
    const match = await bcrypt.compare(password, customer.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.customerLoginPayload(customer);
  }

  private async resolveCustomerFromGoogleProfile(
    emailRaw: string,
    googleName?: string,
  ): Promise<Customer> {
    const email = this.normalizeCustomerEmail(emailRaw);
    let customer = await this.customerRepo
      .createQueryBuilder('c')
      .where('LOWER(c.email) = LOWER(:email)', { email })
      .getOne();

    if (!customer) {
      const fullName =
        googleName && googleName.length > 0
          ? googleName
          : this.displayNameFromEmailLocalPart(email);
      customer = this.customerRepo.create({
        fullName,
        email,
        mobile: null,
        isVerified: true,
      });
      customer = await this.customerRepo.save(customer);
    }
    return customer;
  }

  async loginOrRegisterCustomerWithGoogle(
    idToken: string,
  ): Promise<{ token: string; customer: Customer }> {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      throw new BadRequestException('GOOGLE_CLIENT_ID is not configured');
    }
    const client = new OAuth2Client(clientId);
    let email: string;
    let googleName: string | undefined;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new UnauthorizedException('Google token has no email');
      }
      email = this.normalizeCustomerEmail(payload.email);
      googleName = payload.name?.trim() || undefined;
    } catch (e) {
      if (e instanceof UnauthorizedException || e instanceof BadRequestException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid Google token');
    }

    const customer = await this.resolveCustomerFromGoogleProfile(email, googleName);
    return this.customerLoginPayload(customer);
  }

  async loginOrRegisterCustomerWithGoogleAccessToken(
    accessToken: string,
  ): Promise<{ token: string; customer: Customer }> {
    const trimmed = accessToken?.trim();
    if (!trimmed) {
      throw new BadRequestException('Missing access token');
    }
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${trimmed}` },
    });
    if (!res.ok) {
      throw new UnauthorizedException('Invalid or expired Google session');
    }
    const body = (await res.json()) as {
      email?: string;
      name?: string;
      email_verified?: boolean;
    };
    if (!body.email) {
      throw new UnauthorizedException('Google account has no email');
    }
    const email = this.normalizeCustomerEmail(body.email);
    const googleName = body.name?.trim() || undefined;
    const customer = await this.resolveCustomerFromGoogleProfile(email, googleName);
    return this.customerLoginPayload(customer);
  }

  async sendMobileLinkOtpForCustomer(
    customerId: string,
    newMobileRaw: string,
  ): Promise<{ sent: boolean }> {
    const digits = newMobileRaw.replace(/\D/g, '');
    const mobile = digits.length === 10 ? digits : newMobileRaw.trim();
    if (mobile.replace(/\D/g, '').length < 10) {
      throw new BadRequestException('Enter a valid 10-digit mobile number.');
    }
    const normalized = mobile.replace(/\D/g, '').slice(-10);

    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const taken = await this.customerRepo.findOne({
      where: { mobile: normalized },
    });
    if (taken && taken.id !== customerId) {
      throw new ConflictException('This mobile number is already linked to another account');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000);
    await this.customerRepo.update(customer.id, { otpCode: code, otpExpiresAt });

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE) {
      try {
        const twilio = await import('twilio');
        const twilioClient = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        await twilioClient.messages.create({
          to: normalized.startsWith('+') ? normalized : `+91${normalized}`,
          from: TWILIO_PHONE,
          body: `Your Houznext verification code is ${code}. Valid for 3 minutes.`,
        });
      } catch {
        // ignore
      }
    } else {
      console.log(`[DEV OTP link mobile] ${normalized}: ${code}`);
    }

    return { sent: true };
  }

  private signRepToken(rep: Rep): string {
    return this.jwtService.sign(
      { sub: rep.id, email: rep.email, role: 'rep' },
      { expiresIn: '7d' },
    );
  }

  async sendOtp(
    mobile: string,
    mode: 'login' | 'signup' = 'login',
  ): Promise<{ sent: boolean; customerId: string }> {
    const suffix = normalizePortalMobile(mobile);
    if (suffix.length !== 10) {
      throw new BadRequestException('Enter a valid 10-digit mobile number');
    }

    const livebuild = await this.customerIdentity.findLivebuildByMobile(suffix);
    if (livebuild) {
      await this.customerIdentity.syncPortalFromLivebuild(livebuild);
    }

    let customer = await this.customerIdentity.findPortalByMobile(suffix);
    const isRegisteredCustomer = await this.customerIdentity.isRegisteredOnPlatform(suffix);

    if (mode === 'login' && !isRegisteredCustomer) {
      throw new BadRequestException('This mobile number is not registered. Please sign up first.');
    }
    if (mode === 'signup' && isRegisteredCustomer) {
      throw new BadRequestException('This mobile number is already registered. Please login.');
    }
    if (!customer && mode === 'signup') {
      customer = this.customerRepo.create({
        fullName: '',
        mobile: suffix,
        isVerified: false,
      });
      customer = await this.customerRepo.save(customer);
    }
    if (!customer) {
      throw new BadRequestException('This mobile number is not registered. Please sign up first.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000);
    await this.customerRepo.update(customer.id, { otpCode: code, otpExpiresAt });
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE) {
      try {
        const twilio = await import('twilio');
        const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        await client.messages.create({
          to: `+91${suffix}`,
          from: TWILIO_PHONE,
          body: `Your Houznext verification code is ${code}. Valid for 3 minutes.`,
        });
      } catch {
        // fallback to console in dev
      }
    } else {
      console.log(`[DEV OTP] +91${suffix}: ${code}`);
    }
    return { sent: true, customerId: customer.id };
  }

  async verifyOtp(mobile: string, otp: string): Promise<{ verified: boolean; customerId: string }> {
    const suffix = normalizePortalMobile(mobile);
    const customer = await this.customerIdentity.findPortalByMobile(suffix);
    if (!customer || customer.otpCode !== otp || !customer.otpExpiresAt || customer.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.customerRepo.update(customer.id, {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      mobile: suffix,
    });
    return { verified: true, customerId: customer.id };
  }

  async loginWithOtp(
    mobile: string,
    otp: string,
  ): Promise<{ token: string; customer: Customer; storeUserId?: string }> {
    const suffix = normalizePortalMobile(mobile);
    await this.verifyOtp(suffix, otp);
    const customer = await this.customerIdentity.findPortalByMobile(suffix);
    if (!customer) throw new UnauthorizedException();
    return this.customerLoginPayload(customer);
  }

  async loginWithPassword(
    mobile: string,
    password: string,
  ): Promise<{ token: string; customer: Customer; storeUserId?: string }> {
    const suffix = normalizePortalMobile(mobile);
    const customer = await this.customerIdentity.findPortalByMobile(suffix);
    if (!customer?.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(password, customer.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return this.customerLoginPayload(customer);
  }

  async setPassword(customerId: string, password: string): Promise<void> {
    const hash = await bcrypt.hash(password, 10);
    await this.customerRepo.update(customerId, { passwordHash: hash });
  }

  async loginRep(email: string, password: string): Promise<{ token: string; rep: Rep }> {
    const rep = await this.repRepo.findOne({ where: { email, isActive: true } });
    if (!rep) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(password, rep.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    const token = this.signRepToken(rep);
    return { token, rep };
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customerRepo.findOne({ where: { id } });
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    if (dto.fullName !== undefined) customer.fullName = dto.fullName;
    if (dto.email !== undefined) customer.email = dto.email;
    if (dto.city !== undefined) customer.city = dto.city;
    return this.customerRepo.save(customer);
  }

  async createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    const suffix = normalizePortalMobile(dto.mobile ?? '');
    if (suffix.length !== 10) {
      throw new BadRequestException('Enter a valid 10-digit mobile number');
    }
    const existing = await this.customerIdentity.findPortalByMobile(suffix);
    if (existing) {
      throw new ConflictException('A customer with this mobile number already exists');
    }
    const customer = this.customerRepo.create({
      fullName: dto.fullName,
      mobile: suffix,
      email: dto.email ?? null,
      city: dto.city ?? null,
      locality: dto.locality ?? null,
    });
    return this.customerRepo.save(customer);
  }

  async createProject(dto: CreateProjectDto): Promise<InteriorProject> {
    const project = this.projectRepo.create({
      propertyType: dto.propertyType,
      totalAreaSqft: dto.totalAreaSqft ?? null,
      bhk: dto.bhk ?? null,
      floorNumber: dto.floorNumber ?? null,
      address: dto.address,
      city: dto.city,
      locality: dto.locality,
      pincode: dto.pincode ?? null,
      scopesSelected: dto.scopesSelected ?? [],
      stylePreference: dto.stylePreference ?? null,
      referenceImagesUrls: dto.referenceImagesUrls ?? [],
      totalBudget: dto.totalBudget ?? null,
      budgetNote: dto.budgetNote ?? null,
      expectedStartDate: dto.expectedStartDate ? parseISO(dto.expectedStartDate) : null,
      expectedEndDate: dto.expectedEndDate ? parseISO(dto.expectedEndDate) : null,
      paymentPreference: dto.paymentPreference ?? null,
      specialNotes: dto.specialNotes ?? null,
      floorPlanUrl: dto.floorPlanUrl ?? null,
      customerId: dto.customerId,
      repId: dto.repId ?? null,
    });
    const saved = await this.projectRepo.save(project);
    const milestoneNames = [
      { name: 'Booking advance', sortOrder: 0 },
      { name: '25% milestone', sortOrder: 1 },
      { name: '50% milestone', sortOrder: 2 },
      { name: '90% milestone', sortOrder: 3 },
      { name: 'Handover', sortOrder: 4 },
    ];
    for (const m of milestoneNames) {
      await this.milestoneRepo.save(
        this.milestoneRepo.create({
          projectId: saved.id,
          milestoneName: m.name,
          amount: 0,
          status: 'pending',
          sortOrder: m.sortOrder,
        }),
      );
    }
    return saved;
  }

  async getProject(id: string): Promise<InteriorProject> {
    const project = await this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.customer', 'customer')
      .leftJoinAndSelect('p.rep', 'rep')
      .leftJoinAndSelect('p.trades', 'trades')
      .leftJoinAndSelect('p.paymentMilestones', 'milestones')
      .leftJoinAndSelect('p.documents', 'documents')
      .where('p.id = :id', { id })
      .getOne();
    if (!project) throw new UnauthorizedException('Project not found');
    return project;
  }

  async getCustomerProjects(customerId: string): Promise<InteriorProject[]> {
    return this.projectRepo.find({
      where: { customerId },
      relations: ['customer', 'rep'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllProjects(filters: { status?: string; repId?: string; search?: string }): Promise<InteriorProject[]> {
    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.customer', 'customer')
      .leftJoinAndSelect('p.rep', 'rep');
    if (filters.status) qb.andWhere('p.status = :status', { status: filters.status });
    if (filters.repId) qb.andWhere('p.repId = :repId', { repId: filters.repId });
    if (filters.search) {
      const q = `%${filters.search}%`;
      qb.andWhere('(customer.fullName ILIKE :q OR customer.mobile ILIKE :q)', { q });
    }
    const rows = await qb.orderBy('p.createdAt', 'DESC').getMany();
    for (const p of rows) {
      const openSnags = await this.snagItemRepo.count({
        where: { projectId: p.id, status: 'open' },
      });
      (p as InteriorProject & { openSnagCount?: number }).openSnagCount = openSnags;
      const holdMilestone = await this.milestoneRepo.findOne({
        where: { projectId: p.id, status: 'on_hold' },
      });
      (p as InteriorProject & { hasPaymentHold?: boolean }).hasPaymentHold = Boolean(holdMilestone);
    }
    return rows;
  }

  /**
   * Public portfolio: completed work — isHandedOver, or a saved handoverDate (in case
   * the handover flag was not toggled in admin).
   */
  async getPortfolioProjects(): Promise<InteriorProject[]> {
    return this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.customer', 'customer')
      .leftJoinAndSelect('p.rep', 'rep')
      .leftJoinAndSelect('p.trades', 'trades')
            .where('(p.isHandedOver = :ho OR p.handoverDate IS NOT NULL)', { ho: true })
      .orderBy('p.actualEndDate', 'DESC', 'NULLS LAST')
      .addOrderBy('p.handoverDate', 'DESC', 'NULLS LAST')
      .getMany();
  }

  async updatePortfolioFields(
    id: string,
    dto: UpdatePortfolioDto,
  ): Promise<InteriorProject> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (dto.isPublishedToPortfolio !== undefined) {
      project.isPublishedToPortfolio = dto.isPublishedToPortfolio;
    }
    if (dto.packageTier !== undefined) project.packageTier = dto.packageTier;
    if (dto.deliveredInDays !== undefined) {
      project.deliveredInDays = dto.deliveredInDays;
    }
    if (dto.projectStory !== undefined) project.projectStory = dto.projectStory;
    if (dto.customerTestimonial !== undefined) {
      project.customerTestimonial = dto.customerTestimonial;
    }
    if (dto.customerName !== undefined) project.customerName = dto.customerName;
    if (dto.customerRating !== undefined) {
      project.customerRating = dto.customerRating;
    }
    if (dto.portfolioPhotoUrls !== undefined) {
      project.portfolioPhotoUrls = dto.portfolioPhotoUrls;
    }
    return this.projectRepo.save(project);
  }

  async updateProject(id: string, dto: Partial<CreateProjectDto>): Promise<InteriorProject> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new UnauthorizedException('Project not found');
    if (dto.totalAreaSqft !== undefined) project.totalAreaSqft = dto.totalAreaSqft;
    if (dto.bhk !== undefined) project.bhk = dto.bhk;
    if (dto.floorNumber !== undefined) project.floorNumber = dto.floorNumber;
    if (dto.address !== undefined) project.address = dto.address;
    if (dto.city !== undefined) project.city = dto.city;
    if (dto.locality !== undefined) project.locality = dto.locality;
    if (dto.pincode !== undefined) project.pincode = dto.pincode;
    if (dto.scopesSelected !== undefined) project.scopesSelected = dto.scopesSelected;
    if (dto.stylePreference !== undefined) project.stylePreference = dto.stylePreference;
    if (dto.referenceImagesUrls !== undefined) project.referenceImagesUrls = dto.referenceImagesUrls;
    if (dto.totalBudget !== undefined) project.totalBudget = dto.totalBudget;
    if (dto.budgetNote !== undefined) project.budgetNote = dto.budgetNote;
    if (dto.expectedStartDate !== undefined) project.expectedStartDate = dto.expectedStartDate ? parseISO(dto.expectedStartDate) : null;
    if (dto.expectedEndDate !== undefined) project.expectedEndDate = dto.expectedEndDate ? parseISO(dto.expectedEndDate) : null;
    if (dto.paymentPreference !== undefined) project.paymentPreference = dto.paymentPreference;
    if (dto.specialNotes !== undefined) project.specialNotes = dto.specialNotes;
    if (dto.floorPlanUrl !== undefined) project.floorPlanUrl = dto.floorPlanUrl;
    if (dto.repId !== undefined) project.repId = dto.repId;
    if ((dto as any).isHandedOver !== undefined) {
      (project as any).isHandedOver = (dto as any).isHandedOver;
    }
    if ((dto as any).handoverDate !== undefined) {
      (project as any).handoverDate = (dto as any).handoverDate
        ? parseISO((dto as any).handoverDate)
        : null;
    }
    if ((dto as any).status !== undefined) {
      (project as any).status = (dto as any).status;
    }
    return this.projectRepo.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    const existing = await this.projectRepo.findOne({ where: { id } });
    if (!existing) {
      return;
    }
    await this.projectRepo.delete(id);
  }

  async addTradeToProject(
    projectId: string,
    dto: AddTradeToProjectDto,
  ): Promise<ProjectTrade> {
    const name = dto.customName?.trim();
    if (!name) {
      throw new BadRequestException('Trade name is required');
    }
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const trade = this.projectTradeRepo.create({
      projectId,
      customName: name,
      assignedVendorName: dto.assignedVendorName ?? null,
      assignedVendorPhone: dto.assignedVendorPhone ?? null,
      weightage: dto.weightage != null ? Number(dto.weightage) : 10,
      plannedStartDate: dto.plannedStartDate
        ? parseISO(dto.plannedStartDate)
        : null,
      plannedEndDate: dto.plannedEndDate ? parseISO(dto.plannedEndDate) : null,
      status: 'not_started',
      overallProgress: 0,
    });
    const saved = await this.projectTradeRepo.save(trade);
    return this.projectTradeRepo.findOne({ where: { id: saved.id } }) as Promise<ProjectTrade>;
  }

  async updateTrade(id: string, dto: UpdateTradeDto): Promise<ProjectTrade> {
    const trade = await this.projectTradeRepo.findOne({ where: { id } });
    if (!trade) throw new UnauthorizedException('Trade not found');
    if (dto.customName !== undefined) trade.customName = dto.customName;
    if (dto.assignedVendorName !== undefined) trade.assignedVendorName = dto.assignedVendorName;
    if (dto.assignedVendorPhone !== undefined) trade.assignedVendorPhone = dto.assignedVendorPhone;
    if (dto.overallProgress !== undefined) trade.overallProgress = dto.overallProgress;
    if (dto.status !== undefined) trade.status = dto.status;
    if (dto.weightage !== undefined) trade.weightage = dto.weightage;
    if (dto.plannedStartDate !== undefined) trade.plannedStartDate = dto.plannedStartDate ? parseISO(dto.plannedStartDate) : null;
    if (dto.plannedEndDate !== undefined) trade.plannedEndDate = dto.plannedEndDate ? parseISO(dto.plannedEndDate) : null;
    if (dto.actualStartDate !== undefined) trade.actualStartDate = dto.actualStartDate ? parseISO(dto.actualStartDate) : null;
    if (dto.actualEndDate !== undefined) trade.actualEndDate = dto.actualEndDate ? parseISO(dto.actualEndDate) : null;
    return this.projectTradeRepo.save(trade);
  }

  async computeProjectProgress(projectId: string): Promise<number> {
    const trades = await this.projectTradeRepo.find({ where: { projectId } });
    if (trades.length === 0) return 0;
    const totalWeight = trades.reduce((s, t) => s + Number(t.weightage), 0);
    const weighted = trades.reduce((s, t) => s + Number(t.overallProgress) * Number(t.weightage), 0) / totalWeight;
    const value = Number(weighted.toFixed(2));
    await this.projectRepo.update(projectId, { overallProgress: value });
    return value;
  }

  async addDailyUpdate(dto: AddDailyUpdateDto): Promise<DailyUpdate> {
    const update = this.dailyUpdateRepo.create({
      updateDate: parseISO(dto.updateDate),
      progressDelta: dto.progressDelta,
      cumulativeProgress: dto.cumulativeProgress,
      supervisorName: dto.supervisorName ?? null,
      stageLabel: dto.stageLabel ?? null,
      workDoneToday: dto.workDoneToday ?? null,
      tomorrowPlan: dto.tomorrowPlan ?? null,
      blockerNote: dto.blockerNote ?? null,
      labourCount: dto.labourCount ?? null,
      totalExpenditureToday: dto.totalExpenditureToday ?? null,
      tradeId: dto.tradeId,
      projectId: dto.projectId,
    });
    const saved = await this.dailyUpdateRepo.save(update);
    if (dto.labourEntries?.length) {
      const entries = dto.labourEntries.map((e) =>
        this.labourEntryRepo.create({
          dailyUpdateId: saved.id,
          tradeType: e.tradeType,
          count: e.count,
          hoursWorked: e.hoursWorked ?? null,
          wagePerDay: e.wagePerDay ?? null,
        }),
      );
      await this.labourEntryRepo.save(entries);
    }
    if (dto.materialUsages?.length) {
      const usages = dto.materialUsages.map((u) =>
        this.materialUsageRepo.create({
          dailyUpdateId: saved.id,
          materialName: u.materialName,
          brandName: u.brandName ?? null,
          quantity: u.quantity,
          unit: u.unit,
          unitCost: u.unitCost ?? null,
        }),
      );
      await this.materialUsageRepo.save(usages);
    }
    const trade = await this.projectTradeRepo.findOne({ where: { id: dto.tradeId } });
    if (trade) {
      trade.overallProgress = dto.cumulativeProgress;
      trade.lastUpdatedAt = new Date();
      await this.projectTradeRepo.save(trade);
    }
    if (dto.blockerNote) {
      await this.snagItemRepo.save(
        this.snagItemRepo.create({
          tradeId: dto.tradeId,
          projectId: dto.projectId,
          title: dto.blockerNote,
          raisedBy: dto.supervisorName ?? 'Rep',
          severity: 'medium',
          status: 'open',
        }),
      );
    }
    await this.computeProjectProgress(dto.projectId);
    return this.dailyUpdateRepo.findOne({
      where: { id: saved.id },
      relations: ['labourEntries', 'materialUsages'],
    }) as Promise<DailyUpdate>;
  }

  async getDailyUpdates(tradeId: string, dateFilter?: string): Promise<DailyUpdate[]> {
    const qb = this.dailyUpdateRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.labourEntries', 'labourEntries')
      .leftJoinAndSelect('d.materialUsages', 'materialUsages')
      .where('d.tradeId = :tradeId', { tradeId });
    const now = new Date();
    if (dateFilter === 'today') {
      const today = startOfDay(now);
      qb.andWhere(
        'CAST(d.updateDate AS DATE) = CAST(:today AS DATE)',
        { today: today.toISOString().slice(0, 10) },
      );
    } else if (dateFilter === 'yesterday') {
      const yesterday = startOfDay(subDays(now, 1));
      qb.andWhere(
        'CAST(d.updateDate AS DATE) = CAST(:yesterday AS DATE)',
        { yesterday: yesterday.toISOString().slice(0, 10) },
      );
    } else if (dateFilter === 'week' || dateFilter === 'this_week') {
      const from = subDays(now, 7);
      qb.andWhere('d.updateDate >= :from', { from: from.toISOString().slice(0, 10) });
    } else if (dateFilter === 'month' || dateFilter === 'this_month') {
      const from = subDays(now, 30);
      qb.andWhere('d.updateDate >= :from', { from: from.toISOString().slice(0, 10) });
    }
    return qb.orderBy('d.updateDate', 'DESC').getMany();
  }

  async addDesignUpload(dto: AddDesignDto): Promise<DesignUpload> {
    const upload = this.designUploadRepo.create({
      roomTag: dto.roomTag,
      s3Url: dto.s3Url,
      designType: dto.designType ?? 'full',
      designNotes: dto.designNotes ?? null,
      uploadedBy: dto.uploadedBy,
      version: dto.version ?? 1,
      projectId: dto.projectId,
    });
    const saved = await this.designUploadRepo.save(upload);
    const project = await this.projectRepo.findOne({ where: { id: dto.projectId } });
    if (project) {
      project.designStatus = 'uploaded';
      await this.projectRepo.save(project);
    }
    return saved;
  }

  async getDesignUploads(projectId: string): Promise<Record<string, DesignUpload[]>> {
    const list = await this.designUploadRepo.find({ where: { projectId } });
    const out: Record<string, DesignUpload[]> = {};
    for (const u of list) {
      if (!out[u.roomTag]) out[u.roomTag] = [];
      out[u.roomTag].push(u);
    }
    return out;
  }

  async approveDesign(projectId: string): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) return;
    project.designStatus = 'approved';
    project.designApprovedAt = new Date();
    if (project.status === 'design') project.status = 'execution';
    await this.projectRepo.save(project);
  }

  async requestRevision(projectId: string): Promise<void> {
    await this.projectRepo.update(projectId, { designStatus: 'revision_requested' });
  }

  async addDocument(dto: AddDocumentDto): Promise<ProjectDocument> {
    const doc = this.documentRepo.create({
      category: dto.category,
      documentName: dto.documentName,
      s3Url: dto.s3Url,
      uploadedBy: dto.uploadedBy,
      fileSize: dto.fileSize ?? null,
      expiresAt: dto.expiresAt ? parseISO(dto.expiresAt) : null,
      projectId: dto.projectId,
    });
    return this.documentRepo.save(doc);
  }

  async getDocuments(projectId: string): Promise<Record<string, ProjectDocument[]>> {
    const list = await this.documentRepo.find({ where: { projectId } });
    const out: Record<string, ProjectDocument[]> = {};
    for (const d of list) {
      if (!out[d.category]) out[d.category] = [];
      out[d.category].push(d);
    }
    return out;
  }

  async addMedia(dto: AddMediaDto): Promise<TradeMedia> {
    const media = this.tradeMediaRepo.create({
      dailyUpdateId: dto.dailyUpdateId ?? null,
      s3Url: dto.s3Url,
      mediaType: dto.mediaType ?? 'photo',
      caption: dto.caption ?? null,
      uploadedBy: dto.uploadedBy,
      tradeTag: dto.tradeTag ?? null,
      stageTag: dto.stageTag ?? null,
      takenAt: dto.takenAt ? parseISO(dto.takenAt) : null,
      tradeId: dto.tradeId,
    });
    return this.tradeMediaRepo.save(media);
  }

  async getGallery(
    projectId: string,
    filters: { tradeId?: string; date?: string; week?: boolean; month?: boolean },
  ): Promise<TradeMedia[]> {
    const qb = this.tradeMediaRepo
      .createQueryBuilder('m')
      .innerJoin('m.trade', 't')
      .where('t.projectId = :projectId', { projectId });
    if (filters.tradeId) qb.andWhere('m.tradeId = :tradeId', { tradeId: filters.tradeId });
    if (filters.date) qb.andWhere('m.createdAt::date = :date', { date: filters.date });
    const now = new Date();
    if (filters.week) {
      const from = subDays(now, 7);
      qb.andWhere('m.createdAt >= :from', { from });
    }
    if (filters.month) {
      const from = subDays(now, 30);
      qb.andWhere('m.createdAt >= :from', { from });
    }
    return qb.orderBy('m.createdAt', 'DESC').getMany();
  }

  async updateQcItem(id: string, dto: UpdateQcItemDto): Promise<QcItem> {
    const item = await this.qcItemRepo.findOne({ where: { id } });
    if (!item) throw new UnauthorizedException('QC item not found');
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.checkedBy !== undefined) item.checkedBy = dto.checkedBy;
    if (dto.failureNote !== undefined) item.failureNote = dto.failureNote;
    if (dto.photoUrl !== undefined) item.photoUrl = dto.photoUrl;
    if (dto.status === 'pass' || dto.status === 'fail') {
      item.checkedAt = new Date();
    }
    return this.qcItemRepo.save(item);
  }

  async getQcItems(tradeId: string): Promise<QcItem[]> {
    return this.qcItemRepo.find({
      where: { tradeId },
      order: { sequence: 'ASC' },
    });
  }

  async createSnag(dto: CreateSnagDto): Promise<SnagItem> {
    const snag = this.snagItemRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      raisedBy: dto.raisedBy,
      severity: dto.severity ?? 'medium',
      status: 'open',
      photoUrl: dto.photoUrl ?? null,
      tradeId: dto.tradeId,
      projectId: dto.projectId,
    });
    return this.snagItemRepo.save(snag);
  }

  async resolveSnag(id: string, dto: ResolveSnagDto): Promise<SnagItem> {
    const snag = await this.snagItemRepo.findOne({ where: { id } });
    if (!snag) throw new UnauthorizedException('Snag not found');
    snag.status = 'resolved';
    snag.resolvedAt = new Date();
    snag.resolvedBy = dto.resolvedBy;
    snag.resolutionNote = dto.note;
    return this.snagItemRepo.save(snag);
  }

  async getSnags(projectId: string, status?: string): Promise<SnagItem[]> {
    const where: { projectId: string; status?: string } = { projectId };
    if (status) where.status = status;
    return this.snagItemRepo.find({ where, order: { raisedAt: 'DESC' } });
  }

  async getDelayedTrades(projectId: string): Promise<ProjectTrade[]> {
    const today = startOfDay(new Date()).toISOString().slice(0, 10);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const trades = await this.projectTradeRepo.find({
      where: { projectId },
      relations: [],
    });
    return trades.filter((t) => {
      const plannedEndPast = t.plannedEndDate && t.plannedEndDate < new Date(today) && t.status !== 'completed';
      const stale = t.lastUpdatedAt && t.lastUpdatedAt < threeDaysAgo;
      return plannedEndPast || stale;
    });
  }

  async getProjectActivity(projectId: string): Promise<Record<string, unknown>[]> {
    const updates = await this.dailyUpdateRepo.find({
      where: { projectId },
      relations: ['trade'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
    return updates.map((u) => ({
      type: u.blockerNote ? 'blocker' : u.stageLabel ? 'progress' : 'update',
      text: u.stageLabel
        ? `${(u.trade as any)?.customName ?? 'Trade'} updated to ${u.cumulativeProgress}%`
        : `Daily update added for ${(u.trade as any)?.customName ?? 'Trade'}`,
      subtext: u.stageLabel ?? u.workDoneToday ?? '',
      tradeSlug: '',
      date: u.createdAt,
    }));
  }

  async generateDpr(projectId: string, date: string): Promise<DailyProgressReport> {
    const reportDate = parseISO(date);
    const updates = await this.dailyUpdateRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.labourEntries', 'labourEntries')
      .leftJoinAndSelect('d.materialUsages', 'materialUsages')
      .where('d.projectId = :projectId', { projectId })
      .andWhere('CAST(d.updateDate AS DATE) = CAST(:date AS DATE)', { date })
      .getMany();
    let totalLabour = 0;
    let totalSpend = 0;
    const tradesUpdated: string[] = [];
    for (const u of updates) {
      totalLabour += u.labourCount ?? 0;
      totalSpend += Number(u.totalExpenditureToday ?? 0);
      if (u.tradeId && !tradesUpdated.includes(u.tradeId)) tradesUpdated.push(u.tradeId);
    }
    const reportData = {
      date,
      totalLabour,
      totalSpend,
      tradesUpdated,
      generatedAt: new Date().toISOString(),
    };
    const dpr = this.dprRepo.create({
      projectId,
      reportDate,
      reportData,
    });
    return this.dprRepo.save(dpr);
  }

  async getDprHistory(projectId: string): Promise<DailyProgressReport[]> {
    return this.dprRepo.find({
      where: { projectId },
      order: { reportDate: 'DESC' },
    });
  }

  async getPaymentMilestones(projectId: string): Promise<PaymentMilestone[]> {
    return this.milestoneRepo.find({
      where: { projectId },
      order: { sortOrder: 'ASC' },
    });
  }

  async updateMilestone(id: string, dto: UpdateMilestoneDto): Promise<PaymentMilestone> {
    const m = await this.milestoneRepo.findOne({ where: { id } });
    if (!m) throw new UnauthorizedException('Milestone not found');
    if (dto.milestoneName !== undefined) m.milestoneName = dto.milestoneName;
    if (dto.amount !== undefined) m.amount = dto.amount;
    if (dto.triggerCondition !== undefined) m.triggerCondition = dto.triggerCondition;
    if (dto.status !== undefined) m.status = dto.status;
    if (dto.dueDate !== undefined) m.dueDate = dto.dueDate ? parseISO(dto.dueDate) : null;
    if (dto.paidAt !== undefined) m.paidAt = dto.paidAt ? parseISO(dto.paidAt) : null;
    if (dto.sortOrder !== undefined) m.sortOrder = dto.sortOrder;
    return this.milestoneRepo.save(m);
  }

  async createReferralLead(referrerId: string, dto: CreateReferralDto): Promise<ReferralLead> {
    const lead = this.referralLeadRepo.create({
      referrerId,
      referredName: dto.referredName,
      referredMobile: dto.referredMobile,
      referredEmail: dto.referredEmail ?? null,
      status: 'sent',
    });
    return this.referralLeadRepo.save(lead);
  }

  async getReferralsByCustomer(customerId: string): Promise<ReferralLead[]> {
    return this.referralLeadRepo.find({
      where: { referrerId: customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateReferralStatus(id: string, status: string): Promise<ReferralLead> {
    const lead = await this.referralLeadRepo.findOne({ where: { id } });
    if (!lead) throw new UnauthorizedException('Referral not found');
    lead.status = status;
    return this.referralLeadRepo.save(lead);
  }

  async changeCustomerContact(customerId: string, newMobile: string, otp: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new UnauthorizedException('Customer not found');
    if (
      customer.otpCode !== otp ||
      !customer.otpExpiresAt ||
      customer.otpExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    const normalizedMobile = newMobile.replace(/\D/g, '').slice(-10);
    await this.customerRepo.update(customerId, {
      mobile: normalizedMobile,
      otpCode: null,
      otpExpiresAt: null,
    });
    const updated = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!updated) throw new UnauthorizedException('Customer not found');
    return updated;
  }

  async getProjectFull(id: string): Promise<InteriorProject> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: [
        'customer',
        'rep',
        'trades',
        'paymentMilestones',
        'documents',
        'designUploads',
        'snagItems',
      ],
    });
    if (!project) throw new UnauthorizedException('Project not found');

    const trades = project.trades ?? [];
    for (const t of trades) {
      const dailyUpdates = await this.dailyUpdateRepo.find({
        where: { tradeId: t.id },
        order: { createdAt: 'DESC' },
        take: 30,
        relations: ['labourEntries', 'materialUsages'],
      });
      const media = await this.tradeMediaRepo.find({
        where: { tradeId: t.id },
        order: { createdAt: 'DESC' },
        take: 20,
      });
      (t as ProjectTrade & { dailyUpdates: DailyUpdate[]; media: TradeMedia[] }).dailyUpdates =
        dailyUpdates;
      (t as ProjectTrade & { dailyUpdates: DailyUpdate[]; media: TradeMedia[] }).media = media;
    }

    project.snagItems = (project.snagItems ?? []).filter((s) => s.status === 'open');
    return project;
  }

  async getProjectNotifications(projectId: string): Promise<
    Array<{
      id: string;
      type: 'update' | 'snag' | 'design' | 'milestone';
      title: string;
      body: string;
      createdAt: Date;
      read: boolean;
    }>
  > {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const updates = await this.dailyUpdateRepo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      take: 20,
      relations: ['trade'],
    });

    const since = subDays(new Date(), 7);
    const resolvedSnags = await this.snagItemRepo
      .createQueryBuilder('s')
      .where('s.projectId = :projectId', { projectId })
      .andWhere('s.status = :st', { st: 'resolved' })
      .andWhere('s.resolvedAt IS NOT NULL')
      .andWhere('s.resolvedAt >= :since', { since })
      .orderBy('s.resolvedAt', 'DESC')
      .getMany();

    const designRows = await this.designUploadRepo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      take: 80,
    });
    const recentDesigns = designRows.filter((d) => d.createdAt && d.createdAt >= since);

    const rows: Array<{
      id: string;
      type: 'update' | 'snag' | 'design' | 'milestone';
      title: string;
      body: string;
      createdAt: Date;
      read: boolean;
    }> = [];

    for (const u of updates) {
      const tradeName = (u.trade as ProjectTrade | null)?.customName ?? 'Site update';
      rows.push({
        id: `upd-${u.id}`,
        type: 'update',
        title: `${tradeName} — ${u.cumulativeProgress ?? 0}%`,
        body: u.workDoneToday ?? u.stageLabel ?? '',
        createdAt: u.createdAt,
        read: false,
      });
    }
    for (const s of resolvedSnags) {
      rows.push({
        id: `snag-${s.id}`,
        type: 'snag',
        title: `Resolved: ${s.title ?? 'Snag'}`,
        body: s.resolutionNote ?? s.description ?? '',
        createdAt: s.resolvedAt ?? s.raisedAt,
        read: false,
      });
    }
    for (const d of recentDesigns) {
      rows.push({
        id: `des-${d.id}`,
        type: 'design',
        title: `Design — ${d.roomTag ?? 'Room'}`,
        body: d.designNotes ?? 'New design upload',
        createdAt: d.createdAt,
        read: false,
      });
    }

    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return rows;
  }

  async setMilestoneDueDate(id: string, dueDate: string): Promise<PaymentMilestone> {
    const m = await this.milestoneRepo.findOne({ where: { id } });
    if (!m) throw new UnauthorizedException('Milestone not found');
    m.dueDate = parseISO(dueDate);
    return this.milestoneRepo.save(m);
  }

  async markMilestoneReceived(
    id: string,
    receivedAt: string,
    receiptNote?: string,
  ): Promise<PaymentMilestone> {
    const m = await this.milestoneRepo.findOne({ where: { id } });
    if (!m) throw new UnauthorizedException('Milestone not found');
    m.status = 'paid';
    m.paidAt = parseISO(receivedAt);
    if (receiptNote) {
      m.triggerCondition = `receipt:${receiptNote}`.slice(0, 2000);
    }
    return this.milestoneRepo.save(m);
  }

  async milestoneHold(id: string): Promise<PaymentMilestone> {
    const m = await this.milestoneRepo.findOne({ where: { id } });
    if (!m?.projectId) throw new UnauthorizedException('Milestone not found');
    m.status = 'on_hold';
    await this.milestoneRepo.save(m);
    const proj = await this.projectRepo.findOne({ where: { id: m.projectId } });
    if (proj?.status === 'execution') {
      proj.status = 'on_hold';
      await this.projectRepo.save(proj);
    }
    return this.milestoneRepo.findOne({ where: { id } }) as Promise<PaymentMilestone>;
  }

  async milestoneReleaseHold(id: string): Promise<PaymentMilestone> {
    const m = await this.milestoneRepo.findOne({ where: { id } });
    if (!m?.projectId) throw new UnauthorizedException('Milestone not found');
    m.status = 'paid';
    await this.milestoneRepo.save(m);
    const proj = await this.projectRepo.findOne({ where: { id: m.projectId } });
    if (proj) {
      proj.status = 'execution';
      await this.projectRepo.save(proj);
    }
    return this.milestoneRepo.findOne({ where: { id } }) as Promise<PaymentMilestone>;
  }

  async updateTradeMediaDailyUpdate(
    tradeId: string,
    mediaId: string,
    dailyUpdateId: string | null,
  ): Promise<TradeMedia> {
    const media = await this.tradeMediaRepo.findOne({ where: { id: mediaId } });
    if (!media || media.tradeId !== tradeId) {
      throw new UnauthorizedException('Media not found');
    }
    media.dailyUpdateId = dailyUpdateId;
    return this.tradeMediaRepo.save(media);
  }

  async deleteTradeMedia(tradeId: string, mediaId: string): Promise<void> {
    const media = await this.tradeMediaRepo.findOne({ where: { id: mediaId } });
    if (!media || media.tradeId !== tradeId) {
      throw new UnauthorizedException('Media not found');
    }
    await this.tradeMediaRepo.delete(mediaId);
  }
}
