"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { UserLoginDto, LoginResponse, UserRole } from "@/app/types/auth";
import { loginUser } from '@/app/api/auth';
import { saveToken } from '@/app/utils/auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
        const request: UserLoginDto = { email, password };
        const response: LoginResponse = await loginUser(request);
        saveToken(response.token);
        console.log('Logged in successfully', response.user);

        if (response.user.role === UserRole.USER) {
          router.push("/participant");
        } else if (response.user.role === UserRole.ADMIN) {
          router.push("/coordinator");
        }
        // router.push("/");
    } catch (e) {
        setError((e as Error).message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md p-4 shadow-md">
        <CardHeader>
          <CardTitle className="text-center font-accent text-2xl font-bold">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <Link href={"/auth/signup"}>
            <p className="mt-5 text-dark/60 hover:underline hover:text-dark transition-all duration-200 text-center">
              Do not have an account? Sign Up
            </p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
