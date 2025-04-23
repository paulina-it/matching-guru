"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { PulseLoader } from "react-spinners";
import { Toaster, toast } from "react-hot-toast";
import { updateUser } from "@/app/api/users";
import { formatText } from "@/app/utils/text";
import { uploadProfileImage } from "@/app/api/upload";
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
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserUpdateDto>(() => ({
    id: user?.id ?? 0,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    uniEmail: user?.uniEmail || "",
    studentNumber: user?.studentNumber ? user.studentNumber.toString() : "",
    role: user?.role ?? UserRole.USER,
    organisationId: user?.organisationId ?? undefined,
    personalityType: user?.personalityType
      ? (user.personalityType
          .toUpperCase()
          .replace(" ", "_") as PersonalityType)
      : undefined,
    gender: user?.gender ?? undefined,
    ethnicity: user?.ethnicity || "",
    nationality: user?.nationality || "",
    homeCountry: user?.homeCountry || "",
    livingArrangement: user?.livingArrangement ?? undefined,
    disability: user?.disability || "",
    profileImageUrl: user?.profileImageUrl ?? "/assets/placeholders/avatar.png",
    ageGroup: user?.ageGroup ?? undefined,
  }));

  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(
    formData.profileImageUrl
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // console.log("🔥 formData has updated:", JSON.stringify(formData, null, 2));
  }, [formData]);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (!user || isUserLoaded) return;

    const formattedPersonalityType = user.personalityType
      ? (user.personalityType
          .toUpperCase()
          .replace(" ", "_") as PersonalityType)
      : undefined;

    console.log("🔥 Transformed Personality Type:", formattedPersonalityType);

    setFormData({
      id: user.id ?? 0,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      uniEmail: user.uniEmail || "",
      studentNumber: user.studentNumber || "",
      role: user.role ?? UserRole.USER,
      organisationId: user.organisationId ?? undefined,
      personalityType: formattedPersonalityType,
      gender: (user.gender as Gender) ?? "",
      ethnicity: user.ethnicity || "",
      nationality: user.nationality || "",
      homeCountry: user.homeCountry || "",
      livingArrangement: (user.livingArrangement as LivingArrangement) ?? "",
      disability: user.disability || "",
      profileImageUrl:
        user.profileImageUrl ?? "/assets/placeholders/avatar.png",
      ageGroup: (user.ageGroup as AgeGroup) ?? "",
    });

    setIsUserLoaded(true);
  }, [user, isUserLoaded]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
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

    try {
      let updatedProfileImageUrl = formData.profileImageUrl;

      if (avatar) {
        console.log("Uploading profile image...");

        try {
          updatedProfileImageUrl = await uploadProfileImage(avatar);
          toast.success("Profile image uploaded successfully!");
        } catch (error) {
          console.error("Image Upload Error:", error);
          toast.error("Image upload failed, but other details were updated.");
        }
      }

      const sanitizedFormData: UserUpdateDto = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      ) as UserUpdateDto;

      sanitizedFormData.profileImageUrl = updatedProfileImageUrl;

      await updateUser(sanitizedFormData);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || user.firstName == "") {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="max-w-[90vw] min-w-[60vw] mx-auto my-[5em] p-6 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-md transition-colors dark:border dark:border-white/30 rounded">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        role="form"
        aria-labelledby="account-form-heading"
      >
        <div role="status" aria-live="polite" className="sr-only">
          {isUpdating ? "Updating profile..." : ""}
        </div>

        <h1 id="account-form-heading" className="sr-only">
          Update Account Information
        </h1>

        <div className="flex justify-center items-center flex-col gap-4 mb-6 col-span-2 transition-colors duration-300">
          {preview && (
            <img
              src={preview}
              alt="Profile image preview"
              className="w-32 h-32 object-cover rounded-full shadow-md border border-gray-300  transition-colors duration-300"
            />
          )}
          <Button
            variant="outline"
            type="button"
            aria-label="Update profile picture"
            onClick={() => setImageDialogOpen(true)}
          >
            Update Profile Picture
          </Button>
        </div>
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <DialogHeader>
              <DialogTitle id="dialog-title">
                Update Profile Picture
              </DialogTitle>
            </DialogHeader>

            {/* File Upload */}
            <div className="flex flex-col gap-3">
              <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 text-center transition dark:bg-primary-dark dark:hover:bg-primary-darkHover">
                Upload from Device
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>

              <Button
                variant="outline"
                onClick={handleRemoveAvatar}
                className="w-full"
              >
                Remove Avatar
              </Button>

              {/* URL Upload */}
              <InputField
                id="imageUrlInput"
                label="Or Paste Image URL"
                type="url"
                value={formData.profileImageUrl ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, profileImageUrl: e.target.value })
                }
              />
              <Button
                variant="outline"
                onClick={() => {
                  setPreview(formData.profileImageUrl ?? "");
                  toast.success("Preview updated from URL!");
                }}
              >
                Use Image from URL
              </Button>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="default"
                onClick={() => {
                  setImageDialogOpen(false);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          <div className="grid grid-cols-2 gap-6 col-span-2">
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
                      {formatText(type)}
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
                      {formatText(gender)}
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
                      {formatText(arrangement)}
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
                      {group.replace("AGE_", "").replace(/_/g, "-")}
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
          {isUpdating ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
};

export default Account;
