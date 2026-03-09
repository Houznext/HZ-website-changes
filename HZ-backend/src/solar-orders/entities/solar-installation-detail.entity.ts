import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/user/entities/user.entity';

export type EmiOptionJson = {
    tenure: number; // months
    monthlyEmi: number;
};

@Entity('solar_installation_details')
export class SolarInstallationDetail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // -------- LINK TO ORDER --------
    @OneToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn()
    order: Order;

    @Column({ type: 'uuid' })
    orderId: string;

    // -------- SOLAR SYSTEM SPECS --------
    @Column({ type: 'varchar', length: 50, default: 'residential' })
    solarType: string; // 'residential' | 'commercial'

    @Column({ type: 'varchar', length: 100, default: 'rooftop' })
    category: string; // 'rooftop', 'apartment', 'industrial', etc.

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    monthlyBill: string;

    @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
    recommendedSystemSize: string; // kW

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    annualGeneration: string; // kWh

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    spaceRequired: string; // sq.ft

    // -------- COST BREAKDOWN --------
    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    systemCost: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    subsidy: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    effectiveCost: string;

    // -------- SAVINGS --------
    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    estimatedAnnualSavings: string;

    // -------- EMI --------
    @Column({ type: 'jsonb', nullable: true })
    emiOptions?: EmiOptionJson[];

    // -------- BOOKING / CONTACT --------
    @Column({ type: 'varchar', nullable: true })
    preferredDate?: string;

    @Column({ type: 'varchar', nullable: true })
    contactName?: string;

    @Column({ type: 'varchar', nullable: true })
    contactPhone?: string;

    // -------- AGENT ASSIGNMENT --------
    @Column({ type: 'uuid', nullable: true })
    assignedAgentId?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assignedAgentId' })
    assignedAgent?: User | null;

    @Column({ type: 'timestamp', nullable: true })
    assignedAt?: Date;

    // -------- GENERAL --------
    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
