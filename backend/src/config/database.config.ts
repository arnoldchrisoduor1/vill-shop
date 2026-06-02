import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'villshop',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'villshop',
    entities: [__dirname + '/../database/entities/*.entity.{ts,js}'],
    migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
    synchronize: false,
    logging: false,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }),
);
