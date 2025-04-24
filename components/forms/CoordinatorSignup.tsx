import { UserCreateDto, UserRole } from "@/app/types/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import InputField from "../InputField";
import { Button } from "../ui/button";

interface FormProps {
  formData: UserCreateDto;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl?: string;
  isSubmitting: boolean;
  invalidFields: string[];
  confirmEmail: string;
  setConfirmEmail: (val: string) => void;
  orgExists: "yes" | "no";
  setOrgExists: (value: "yes" | "no") => void;
  hasInvite: boolean;
}

export const CoordinatorForm: React.FC<FormProps> = ({
  formData,
  onChange,
  onSubmit,
  confirmPassword,
  handleImageChange,
  previewUrl,
  isSubmitting,
  invalidFields,
  confirmEmail,
  setConfirmEmail,
  orgExists,
  setOrgExists,
  hasInvite,
}) => {
  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email.toLowerCase() !== confirmEmail.toLowerCase()) {
      toast.error("Emails do not match.");
      return;
    }
    if (
      formData.role === UserRole.ADMIN &&
      orgExists === "yes" &&
      !formData.joinCode?.trim() &&
      !hasInvite
    ) {
      toast.error("Join code is required for existing organisations.");
      return;
    }

    onSubmit(e);
  };
  return (
    <form
      className="grid grid-cols-1  md:grid-cols-2 gap-4 gap-y-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="col-span-2 text-xl font-bold text-center mb-4">
        Coordinator Signup
      </h2>
      <div className="flex flex-col items-center gap-3 mt-4 row-span-2">
        <img
          src={previewUrl}
          alt="Profile Preview"
          className="w-32 h-32 object-cover rounded-full border-2 border-gray-300 dark:border-light/70 shadow-md"
        />

        <label className="cursor-pointer bg-primary dark:bg-primary-dark dark:hover:bg-primary-darkHover text-white px-4 py-2 rounded shadow-md hover:bg-primary/80 transition">
          Choose Profile Picture
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      <InputField
        id="firstName"
        label="First Name*"
        value={formData.firstName}
        onChange={onChange}
        required={true}
        placeholder="Enter your first name"
        hasError={invalidFields.includes("firstName")}
      />
      <InputField
        id="lastName"
        label="Last Name*"
        value={formData.lastName}
        onChange={onChange}
        required={true}
        placeholder="Enter your last name"
        hasError={invalidFields.includes("lastName")}
      />
      <InputField
        id="email"
        label="University/Work Email*"
        value={formData.email}
        onChange={onChange}
        required={true}
        placeholder="e.g. name@university.ac.uk"
        hasError={invalidFields.includes("email")}
      />
      <InputField
        id="confirmEmail"
        label="Confirm Email*"
        value={confirmEmail}
        onChange={handleConfirmEmailChange}
        required={true}
        placeholder="Confirm your university/work email"
        hasError={invalidFields.includes("confirmEmail")}
      />
      <InputField
        id="password"
        label="Password*"
        type="password"
        value={formData.password}
        onChange={onChange}
        required={true}
        placeholder="Enter your password"
        hasError={invalidFields.includes("password")}
      />
      <InputField
        id="confirmPassword"
        label="Confirm Password*"
        type="password"
        value={confirmPassword}
        onChange={onChange}
        required={true}
        placeholder="Confirm your password"
        hasError={invalidFields.includes("confirmPassword")}
      />
      <p className="text-sm text-gray-500 -mt-6 col-span-2">
        Must include uppercase, lowercase and a number. Min 8 characters.
      </p>
      <div className="col-span-2 md:col-span-1">
        <p className="text-gray-700 mb-2">
          Does your organisation already exist in the system?
        </p>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="orgExists"
              value="yes"
              checked={orgExists === "yes"}
              onChange={() => setOrgExists("yes")}
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="orgExists"
              value="no"
              checked={orgExists === "no"}
              onChange={() => setOrgExists("no")}
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {orgExists === "yes" && !hasInvite && (
        <InputField
          id="joinCode"
          label="Organisation Join Code*"
          value={formData.joinCode || ""}
          onChange={onChange}
          required={orgExists === "yes"}
          placeholder="Enter your join code"
          hasError={invalidFields.includes("joinCode")}
        />
      )}

      <Button type="submit" className="w-full h-12 text-xl col-span-2">
        {isSubmitting ? "Signing Up..." : "Signup"}
      </Button>
    </form>
  );
};
