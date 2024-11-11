"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/app/api/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await login({ email, password });
    if (response) {
      const userRole = response.user.role;
      if (userRole === "ADMIN") {
        router.push("/coordinator");
      } else if (userRole === "USER") {
        router.push("/participant");
      }
    }
  };

  return (
    <div>
      <Header />
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
                {loading ? "Logging in..." : "Login"}
              </Button>{" "}
              {/* Display error if login fails */}
              {error && (
                <p className="text-red-500 text-center mt-2">{error}</p>
              )}
            </form>
            <Link href={"/auth/signup"}>
              <p className="mt-5 text-dark/60 hover:underline hover:text-dark transition-all duration-200 text-center">
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
