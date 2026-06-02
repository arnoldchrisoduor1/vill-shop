'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { registerSchema, type RegisterFormData } from '../../../validators/auth';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created successfully!');
      router.push('/account');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Registration failed');
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
            <h1 className="text-xl font-semibold mt-4">Create Account</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Join Vill Shop today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" placeholder="your@email.com" {...register('email')} error={errors.email?.message} />
            <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
            <Input label="Confirm Password" type="password" placeholder="••••••••" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Create Account</Button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
