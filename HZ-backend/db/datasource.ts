import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSourceOptions, DataSource } from 'typeorm';

const envPath = path.resolve(
  process.cwd(),
  `.env.${process.env.NODE_ENV || 'development'}`,
);
dotenv.config({ path: envPath });

const postgresUrl = process.env.POSTGRES_URL;


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
