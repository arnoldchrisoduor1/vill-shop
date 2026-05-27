'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useAuth } from '@/context';
import { profileSchema, type ProfileFormData } from '@/validators';
import { ApiFetchError } from '@/lib/api';

export default function AccountProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
    } catch (err) {
      const message =
        err instanceof ApiFetchError ? err.message : 'Update failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="mb-6 text-xl font-semibold">Profile Settings</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <Input
            label="Full Name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
