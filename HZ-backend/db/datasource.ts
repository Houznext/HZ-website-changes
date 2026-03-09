import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSourceOptions, DataSource } from 'typeorm';

const envPath = path.resolve(
  process.cwd(),
  `.env.${process.env.NODE_ENV || 'development'}`,
);
dotenv.config({ path: envPath });
dotenv.config();

const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!postgresUrl) {
  // Keep startup diagnostics explicit for cloud deploys.
  console.warn('Database URL is missing. Set DATABASE_URL (or POSTGRES_URL).');
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: postgresUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  logging: false,
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
