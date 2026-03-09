import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ResourceService {
  constructor(private dataSource: DataSource) {}

  getAllEntityNames(): string[] {
    return this.dataSource.entityMetadatas.map(
      (meta) => meta.tableName 
    );
  }
}