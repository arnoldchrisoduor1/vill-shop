'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { loginSchema, type LoginFormData } from '../../../validators/auth';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'sonner';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.push(redirect);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-[var(--color-primary)]">Vill Shop</Link>
            <h1 className="text-xl font-semibold mt-4">Sign In</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Welcome back!</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="your@email.com" {...register('email')} error={errors.email?.message} />
            <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Sign In</Button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[var(--color-primary)] font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-muted)]">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
