import { Blog } from 'src/blog/entities/blog.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CostEstimator } from 'src/cost-estimator/entities/cost-estimator.entity';
import { InvoiceEstimator } from 'src/invoice-estimator/entities/invoice-estimator.entity';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { FurnitureLeads } from 'src/furnitureleads/entities/furniture-leads.entity';
import { Property } from 'src/property/entities/property.entity';
import { Reviews } from 'src/reviews/entities/reviews.entity';
import { Testimonials } from 'src/testimonials/entity/testimonials.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import { CRMLead } from 'src/crm/entities/crm.entity';
import { ServiceCustomLead } from 'src/servicecustomlead/entities/servicecustomlead.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';
import { Company } from 'src/company-onboarding/entities/company.entity';
import { CBQuery } from 'src/Custombuilder/Query/entities/query.entity';
import { BasicDetails } from 'src/property/entities/basicDetails.entity';
import { IndianState, UserKind, UserRole } from '../enum/user.enum';
import { LocationDetails } from 'src/property/entities/location.entity';
import { Exclude } from 'class-transformer';
import { Referral } from 'src/Referral/entities/referral.entity';
import { ContactUs } from 'src/contactus/entities/contact-us.entity';
import { DailyProgress } from 'src/Custombuilder/daily-progress/entities/daily-progress.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { UserBranchMembership } from 'src/branch/entities/user-branch-membership.entity';
import { EmployeeHrDetails } from 'src/employee-hr/entity/employee-hr.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  profile: string | null;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true, default: null })
  agent: boolean;

  @Column({ nullable: true, default: false })
  isVerified: boolean;

  @Column({ nullable: true, default: null })
  fullName: string | null;

  @Column({ nullable: true, default: null })
  firstName: string | null;

  @Column({ nullable: true, default: null })
  lastName: string | null;

  @Column({ nullable: true, default: null })
  email: string | null;

  @Column({ nullable: true, default: null })
  phone: string | null;

  @Column({ nullable: true, default: null })
  priceRange: string;

  @Column({ nullable: true, default: null })
  whatsappNumber: string;

  @Column({ nullable: true, type: 'uuid' })
    createdById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  @Column({ type: 'enum', enum: UserKind, default: UserKind.CUSTOMER })
  kind!: UserKind;

  @Column({ type: 'varchar', length: 20, default: UserRole.STANDARD })
  role!: UserRole;

  @OneToMany(() => Referral, (referral) => referral.referrer)
  referrals: Referral[];

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  states: IndianState[];

  @OneToMany(() => Property, (property) => property.postedByUser)
  properties: Property[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Blog, (Blog) => Blog.createdBy)
  createdBlogs: Blog[];

  @OneToMany(() => Blog, (Blog) => Blog.updatedBy)
  updatedBlogs: Blog[];

  @OneToMany(() => Testimonials, (testimonials) => testimonials.user)
  testimonials: Testimonials[];

  @OneToMany(() => LocationDetails, (location) => location.user)
  locations: LocationDetails[];

  @OneToMany(() => FurnitureLeads, (furnitureLeads) => furnitureLeads.user)
  furnitureLeads: FurnitureLeads[];

  @OneToMany(() => CustomBuilder, (customBuilder) => customBuilder.customer, {
    cascade: true,
  })
  customBuilders: CustomBuilder[];

  @OneToMany(
    () => CustomBuilder,
    (customBuilder) => customBuilder.createdByUser,
  )
  createdCustomBuilders: CustomBuilder[];

  @OneToMany(() => CostEstimator, (costEstimator) => costEstimator.postedBy, {
    cascade: true,
  })
  costEstimators: CostEstimator[];

  @OneToMany(
    () => InvoiceEstimator,
    (InvoiceEstimator) => InvoiceEstimator.postedBy,
    {
      cascade: true,
    },
  )
  invoiceEstimators: InvoiceEstimator[];

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart?: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Reviews, (review) => review.user)
  reviews: Reviews[];

  @OneToMany(() => DailyProgress, (progress) => progress.uploadedBy)
  dailyProgressLogs: DailyProgress[];

  @OneToOne(() => Wishlist, (wishlist) => wishlist.user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  wishlist: Wishlist;

  @OneToMany(() => CRMLead, (crmLead) => crmLead.assignedTo)
  crmLeads: CRMLead[];

  @OneToMany(() => ServiceCustomLead, (serviceLead) => serviceLead.assignedTo)
  serviceleads: ServiceCustomLead[];

  @OneToMany(() => ContactUs, (contact) => contact.assignedTo)
  ContactUs: ContactUs[];

  @ManyToOne(() => Project, (project) => project.sellers, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  project: Project;

  @OneToMany(() => CBQuery, (query) => query.user)
  queries: CBQuery[];

  @OneToOne(() => Company, (company) => company.developerInformation, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  company: Company;

  @OneToMany(() => BasicDetails, (basicDetails) => basicDetails.postedByUser)
  basicDetailsList: BasicDetails[];

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  currentBranch?: Branch | null;

  @OneToMany(() => UserBranchMembership, (m) => m.user)
  branchMemberships: UserBranchMembership[];

  @OneToOne(() => EmployeeHrDetails, (hr) => hr.user)
  hrDetails?: EmployeeHrDetails;

  @Column({ nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;
}
