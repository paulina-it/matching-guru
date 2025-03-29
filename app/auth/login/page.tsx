"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/app/context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { Toaster, toast } from "react-hot-toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading, clearError } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = [];

    if (!email) errors.push("Please enter a valid email.");
    if (!password) errors.push("Please enter your password.");

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }
    const response = await login({ email, password });
    if (response) {
      const userRole = response.user.role;
      if (userRole === "ADMIN") {
        router.push("/coordinator");
      } else if (userRole === "USER") {
        router.push("/participant");
      }
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <div>
      <Header />
      <div className="flex justify-center items-center min-h-screen bg-primary dark:bg-primary-dark">
        <Toaster position="top-right" />
        <Card className="lg:w-full w-[95vw] max-w-md p-4 shadow-md">
          <CardHeader>
            <CardTitle className="text-center font-accent text-2xl font-bold">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
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
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <Link href={"/auth/signup"}>
              <p className="mt-5 text-dark/60 dark:text-light/70 hover:underline hover:text-dark transition-all duration-200 text-center">
                Do not have an account? Sign Up
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
