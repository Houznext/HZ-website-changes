import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export type LivebuildNotificationPrefs = {
  dpr: boolean;
  query: boolean;
  payment: boolean;
  hold: boolean;
  doc: boolean;
};

export const DEFAULT_LIVEBUILD_NOTIFICATION_PREFS: LivebuildNotificationPrefs = {
  dpr: true,
  query: true,
  payment: true,
  hold: false,
  doc: true,
};

@Entity('livebuild_admin_settings')
export class LivebuildAdminSettings {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({ type: 'jsonb' })
  notifications: LivebuildNotificationPrefs;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
