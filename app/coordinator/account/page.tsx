"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Account = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) return <p className="text-center text-lg font-bold">Loading...</p>;

  return (
    <div className="max-w-[40em] min-w-[30em] mx-auto rounded-lg p-6 bg-white shadow-md">
      <div className="flex justify-center items-center gap-10 mb-4">
        <img
          src={user?.profileImageUrl || "/assets/placeholders/avatar.png"}
          alt="Profile Preview"
          className="w-32 h-32 object-cover rounded-full shadow-md"
        />
        <div>
          <h2 className="h2">
            {user.firstName} {user.lastName}
          </h2>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Role: <span className="text-primary">{user.role}</span>
          </h3>
        </div>
      </div>

      {/* Organisation Info */}
      {user.organisationName && (
        <div className="mb-4">
          <p className="text-gray-700">
            <span className="font-bold">Organisation:</span>{" "}
            {user.organisationName}
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-bold">Email:</span> {user.email}
        </p>
        {user.uniEmail && (
          <p className="text-gray-700">
            <span className="font-bold">University Email:</span> {user.uniEmail}
          </p>
        )}
      </div>
    </div>
  );
};

export default Account;
