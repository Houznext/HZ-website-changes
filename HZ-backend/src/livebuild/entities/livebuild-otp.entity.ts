import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('livebuild_otps')
export class LivebuildOtp {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  mobile: string;

  @Column({ type: 'varchar', length: 10 })
  otp: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;
}
