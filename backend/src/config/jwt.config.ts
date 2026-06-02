import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    signOptions: { expiresIn: '7d' },
  }),
);
