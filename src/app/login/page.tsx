// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Section from '@/components/Section/Section';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import Image from 'next/image';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <Section>
      <div className="max-w-md mx-auto text-center">
        <Image
          src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg"
          alt="TST logo"
          width={200}
          height={100}
          className="mx-auto mb-8"
        />
        <h1 className="text-4xl font-extrabold mb-8">Admin Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="bg-tst-purple">
            Login
          </Button>
          {error && (
            <p className="text-red-500 mt-4 bg-red-100 p-3 rounded-lg border border-red-500">
              <strong>Error:</strong> {error}
            </p>
          )}
        </form>
      </div>
    </Section>
  );
};

export default LoginPage;
