'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '../../../lib/api/users';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, email: user?.email, phone: user?.phone },
  });

  const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: pwErrors } } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileData) => {
    setProfileLoading(true);
    try {
      await usersApi.updateProfile(data);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setPasswordLoading(true);
    try {
      await usersApi.changePassword(data);
      resetPassword();
      toast.success('Password changed!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
        <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4 max-w-md">
          <Input label="Full Name" {...regProfile('name')} error={profileErrors.name?.message} />
          <Input label="Email" type="email" {...regProfile('email')} error={profileErrors.email?.message} />
          <Input label="Phone" type="tel" {...regProfile('phone')} error={profileErrors.phone?.message} />
          <Button type="submit" isLoading={profileLoading}>Save Changes</Button>
        </form>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold mb-6">Change Password</h2>
        <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4 max-w-md">
          <Input label="Current Password" type="password" {...regPassword('currentPassword')} error={pwErrors.currentPassword?.message} />
          <Input label="New Password" type="password" {...regPassword('newPassword')} error={pwErrors.newPassword?.message} />
          <Button type="submit" isLoading={passwordLoading}>Change Password</Button>
        </form>
      </div>
    </div>
  );
}
