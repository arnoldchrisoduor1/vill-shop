import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'villshop',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'villshop',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [path.join(__dirname, 'entities/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
  synchronize: false,
  logging: false,
});

const command = process.argv[2];

if (command === 'run') {
  AppDataSource.initialize()
    .then(async () => {
      console.log('Running migrations...');
      await AppDataSource.runMigrations();
      console.log('Migrations complete!');
      await AppDataSource.destroy();
    })
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
} else if (command === 'revert') {
  AppDataSource.initialize()
    .then(async () => {
      console.log('Reverting last migration...');
      await AppDataSource.undoLastMigration();
      console.log('Migration reverted!');
      await AppDataSource.destroy();
    })
    .catch((err) => {
      console.error('Revert error:', err);
      process.exit(1);
    });
}

export default AppDataSource;
