import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User, UserRole } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private setAuthCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private signToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async register(dto: RegisterDto, res: Response) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const user = this.userRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 12),
      role: UserRole.CUSTOMER,
    });
    await this.userRepo.save(user);

    const token = this.signToken(user);
    this.setAuthCookie(res, token);

    const { password: _p, ...safeUser } = user;
    return { user: safeUser, message: 'Registration successful' };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isBanned) throw new UnauthorizedException('Account suspended');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user);
    this.setAuthCookie(res, token);

    const { password: _p, ...safeUser } = user;
    return { user: safeUser, message: 'Login successful' };
  }

  logout(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out' };
  }

  getMe(user: User) {
    const { password: _p, ...safeUser } = user;
    return safeUser;
  }
}
