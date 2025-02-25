"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "react-hot-toast";
import { updateUser, uploadImage } from "@/app/api/users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectInputLabel,
  SelectValue,
} from "@/components/ui/select";

import {
  UserUpdateDto,
  Gender,
  UserRole,
  PersonalityType,
  LivingArrangement,
  AgeGroup,
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
    try {
      let updatedProfileImageUrl = formData.profileImageUrl;
  
      if (avatar) {
        console.log("Uploading profile image...");
        const imageData = new FormData();
        imageData.append("file", avatar);
        imageData.append("email", formData.email);
  
        try {
          updatedProfileImageUrl = await uploadImage(imageData);
          toast.success("Profile image uploaded successfully!");
        } catch (error) {
          console.error("Image Upload Error:", error);
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
    }
  };
  

  return (
    <div className="max-w-[40em] min-w-[30em] mx-auto my-[5em] rounded-lg p-6 bg-white shadow-md">
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
        {user?.role == UserRole.USER ? (
          <div>
            <InputField
              id="studentNumber"
              label="Student Number"
              value={formData.studentNumber?.toString() || ""}
              onChange={handleChange}
            />
            <div>
              <SelectInputLabel htmlFor="personalityType">
                Personality Type
              </SelectInputLabel>
              <Select
                name="personalityType"
                value={formData.personalityType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    personalityType: value as PersonalityType,
                  })
                }
              >
                <SelectTrigger id="personalityType">
                  <SelectValue placeholder="Select Personality Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PersonalityType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <SelectInputLabel htmlFor="gender">Gender</SelectInputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value as Gender })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Gender).map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <SelectInputLabel htmlFor="livingArrangement">
                Living Arrangement
              </SelectInputLabel>
              <Select
                name="livingArrangement"
                value={formData.livingArrangement}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    livingArrangement: value as LivingArrangement,
                  })
                }
              >
                <SelectTrigger id="livingArrangement">
                  <SelectValue placeholder="Select Living Arrangement" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LivingArrangement).map((arrangement) => (
                    <SelectItem key={arrangement} value={arrangement}>
                      {arrangement}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <SelectInputLabel htmlFor="ageGroup">Age Group</SelectInputLabel>
              <Select
                name="ageGroup"
                value={formData.ageGroup}
                onValueChange={(value) =>
                  setFormData({ ...formData, ageGroup: value as AgeGroup })
                }
              >
                <SelectTrigger id="ageGroup">
                  <SelectValue placeholder="Select Age Group" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AgeGroup).map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <InputField
              id="ethnicity"
              label="Ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
            />
            <InputField
              id="nationality"
              label="Nationality"
              value={formData.nationality}
              onChange={handleChange}
            />
            <InputField
              id="homeCountry"
              label="Home Country"
              value={formData.homeCountry}
              onChange={handleChange}
            />
            <InputField
              id="disability"
              label="Disability"
              value={formData.disability}
              onChange={handleChange}
            />
          </div>
        ) : (
          <></>
        )}

        <Button type="submit" className="col-span-2">
          Update Profile
        </Button>
      </form>
    </div>
  );
};

export default Account;
