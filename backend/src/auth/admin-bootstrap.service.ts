import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../database/entities/user.entity';

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!email) {
      throw new Error(
        'ADMIN_EMAIL is required. Set ADMIN_EMAIL in your environment before starting the server.',
      );
    }

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      let updated = false;
      if (existing.role !== UserRole.ADMIN) {
        existing.role = UserRole.ADMIN;
        updated = true;
      }
      if (existing.isBanned) {
        existing.isBanned = false;
        updated = true;
      }
      if (updated) {
        await this.userRepo.save(existing);
        this.logger.log(`Promoted existing user to admin: ${email}`);
      } else {
        this.logger.log(`Admin account verified: ${email}`);
      }
      return;
    }

    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      this.logger.warn(
        `ADMIN_PASSWORD is not set. Creating admin ${email} with default password "password". Change it immediately.`,
      );
    }

    const admin = this.userRepo.create({
      email,
      name: process.env.ADMIN_NAME || 'Admin',
      password: await bcrypt.hash(password || 'password', 12),
      role: UserRole.ADMIN,
    });
    await this.userRepo.save(admin);
    this.logger.log(`Admin account created: ${email}`);
  }
}
