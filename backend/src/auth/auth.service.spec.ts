import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../database/entities/user.entity';

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  password: '',
  name: 'Test User',
  phone: undefined as string | undefined,
  role: UserRole.CUSTOMER,
  isBanned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined as Date | undefined,
} as User;

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user and return token cookie', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const hashedPassword = await bcrypt.hash('password123', 12);
      const savedUser = { ...mockUser, password: hashedPassword };
      mockUserRepo.create.mockReturnValue(savedUser);
      mockUserRepo.save.mockResolvedValue(savedUser);

      const result = await service.register(
        { email: 'test@example.com', password: 'password123', name: 'Test User' },
        mockRes,
      );

      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-jwt-token',
        expect.any(Object),
      );
      expect(result.message).toBe('Registration successful');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register(
          { email: 'test@example.com', password: 'password123', name: 'Test User' },
          mockRes,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 12);
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, password: hashedPassword });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user (without password) with correct credentials', async () => {
      const correctPassword = 'correct-password123';
      const hashedPassword = await bcrypt.hash(correctPassword, 12);
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, password: hashedPassword });

      const result = await service.login(
        { email: 'test@example.com', password: correctPassword },
        mockRes,
      );

      expect(result.user).not.toHaveProperty('password');
      expect(result.message).toBe('Login successful');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-jwt-token',
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'any' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
