import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LivebuildRoom } from './livebuild-room.entity';
import { LivebuildWorkType } from './livebuild-work-type.entity';

@Entity('livebuild_room_work_types')
export class LivebuildRoomWorkType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id', type: 'int' })
  roomId: number;

  @ManyToOne(() => LivebuildRoom, (r) => r.roomWorkTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: LivebuildRoom;

  @Column({ name: 'work_type_id', type: 'int' })
  workTypeId: number;

  @ManyToOne(() => LivebuildWorkType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_type_id' })
  workType: LivebuildWorkType;

  @Column({ type: 'int', default: 0 })
  pct: number;

  @Column({ type: 'varchar', length: 20, default: 'not_started' })
  status: string;
}
