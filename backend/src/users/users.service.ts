import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password: _p, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    const { password: _p, ...safeUser } = saved;
    return safeUser as Omit<User, 'password'>;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.save(user);
  }

  async adminFindAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ items: Omit<User, 'password'>[]; total: number }> {
    const where = search
      ? [{ name: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }]
      : {};

    const [users, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = users.map(({ password: _p, ...u }) => u as Omit<User, 'password'>);
    return { items, total };
  }

  async adminFindById(id: string): Promise<Record<string, unknown>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password: _p, ...safeUser } = user;
    return safeUser;
  }

  async banUser(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isBanned = true;
    const saved = await this.userRepo.save(user);
    this.eventEmitter.emit('user.banned', { user: saved });
  }

  async unbanUser(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isBanned = false;
    const saved = await this.userRepo.save(user);
    this.eventEmitter.emit('user.unbanned', { user: saved });
  }
}
