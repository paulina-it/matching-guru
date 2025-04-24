"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PulseLoader } from "react-spinners";
import { FaUser, FaUserShield } from "react-icons/fa";
import Image from "next/image";
import { getUserById, updateUser } from "@/app/api/users";
import { UserResponseDto, UserUpdateDto } from "@/app/types/auth";
import { formatText } from "@/app/utils/text";
import toast from "react-hot-toast";
import { AdminUserControls } from "@/components/AdminUserControls";
import { useAuth } from "@/app/context/AuthContext";

const UserDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        const userData = await getUserById(parseInt(params.id));
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">User not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
      <div className="flex items-center gap-6 mb-8">
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full object-cover border-2 border-secondary"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl text-white">
            {user.role === "ADMIN" ? <FaUserShield /> : <FaUser />}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {user.role.toLowerCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <Info label="Email" value={user.email} />
        <Info label="University Email" value={user.uniEmail} />
        <Info label="Student Number" value={user.studentNumber?.toString()} />
        <Info label="Course Name" value={user.courseName} />
        <Info label="Organisation" value={user.organisationName} />
        <Info label="Gender" value={formatText(user.gender)} />
        <Info label="Age Group" value={formatText(user.ageGroup)} />
        <Info label="Nationality" value={user.nationality} />
        <Info label="Home Country" value={user.homeCountry} />
        <Info label="Ethnicity" value={user.ethnicity} />
        <Info label="Disability" value={user.disability} />
        <Info
          label="Living Arrangement"
          value={formatText(user.livingArrangement)}
        />
        <Info label="Personality Type" value={user.personalityType} />
      </div>

      {/* {currentUser?.role === "ADMIN" && (
        <AdminUserControls
          user={{
            id: user.id,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            studentNumber: user.studentNumber,
          }}
          onUpdate={async (updated) => {
            try {
              const updatedUser = await updateUser({ id: user.id, ...updated } as UserUpdateDto);
              setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
            //   toast.success("User updated successfully");
            } catch (err) {
              toast.error("Failed to update user.");
            }
          }}          
        />
      )} */}
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-muted-foreground">{label}</span>
    <span className="text-sm text-zinc-800 dark:text-zinc-200">
      {value ?? "—"}
    </span>
  </div>
);

export default UserDetailsPage;
