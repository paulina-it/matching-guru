"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "react-hot-toast";
import { updateUser } from "@/app/api/users";
import { uploadProfileImage } from "@/app/api/upload";
import {
  UserUpdateDto,
  UserRole
} from "@/app/types/auth";

const Account = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<UserUpdateDto>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    uniEmail: "",
    studentNumber: undefined,
    role: UserRole.USER,
    organisationId: undefined,
    personalityType: undefined,
    gender: undefined,
    ethnicity: "",
    nationality: "",
    homeCountry: "",
    livingArrangement: undefined,
    disability: "",
    profileImageUrl: undefined,
    ageGroup: undefined,
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(
    formData.profileImageUrl
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/");
    } else {
      setFormData((prev) => ({
        id: user.id ?? prev.id,
        firstName: user.firstName ?? prev.firstName,
        lastName: user.lastName ?? prev.lastName,
        email: user.email ?? prev.email,
        uniEmail: user.uniEmail ?? prev.uniEmail,
        studentNumber: user.studentNumber ?? prev.studentNumber,
        role: user.role ?? prev.role,
        organisationId: user.organisationId ?? prev.organisationId,
        personalityType: user.personalityType ?? prev.personalityType,
        gender: user.gender ?? prev.gender,
        ethnicity: user.ethnicity ?? prev.ethnicity,
        nationality: user.nationality ?? prev.nationality,
        homeCountry: user.homeCountry ?? prev.homeCountry,
        livingArrangement: user.livingArrangement ?? prev.livingArrangement,
        disability: user.disability ?? prev.disability,
        profileImageUrl: user.profileImageUrl ?? prev.profileImageUrl,
        ageGroup: user.ageGroup ?? prev.ageGroup,
      }));
      setPreview(user.profileImageUrl ?? "/assets/placeholders/avatar.png");
    }
  }, [user, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setPreview("/assets/placeholders/avatar.png");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
  
    let updatedProfileImageUrl = formData.profileImageUrl;
  
    try {
      if (avatar) {
        if (avatar.size >  1024 * 1024) {
          toast.error("File is too large. Max size is 1MB.");
          return; 
        }
  
        try {
          updatedProfileImageUrl = await uploadProfileImage(avatar);
          toast.success("Profile image uploaded successfully!");
        } catch (uploadError) {
          console.error("Image Upload Error:", uploadError);
          toast.error("Image upload failed, but other details were updated.");
        }
      }
      await updateUser({
        ...formData,
        profileImageUrl: updatedProfileImageUrl,
      });
  
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  

  return (
    <div className="max-w-[40em] min-w-[30em] mx-auto my-[5em] rounded p-6 bg-white shadow-md dark:bg-dark dark:border dark:border-white">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="flex justify-center items-center gap-10 mb-4 col-span-2">
          {preview && (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-32 h-32 object-cover rounded-full shadow-md"
            />
          )}
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded shadow-md hover:bg-primary/80 transition">
              Choose Profile Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <Button onClick={handleRemoveAvatar} variant="outline">
              Remove Avatar
            </Button>
          </div>
        </div>

        <InputField
          id="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
        />
        <InputField
          id="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />
        <InputField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <InputField
          id="uniEmail"
          label="University Email"
          type="email"
          value={formData.uniEmail || ""}
          onChange={handleChange}
        />
       
       <Button type="submit" className="col-span-2">
          {isUpdating ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
};

export default Account;
