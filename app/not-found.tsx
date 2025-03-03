"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-accent">404 - Page Not Found</h1>
      <p className="text-gray-600 mt-2">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-hover transition"
      >
        Go to Home
      </Link>
    </div>
  );
}
