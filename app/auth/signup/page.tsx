"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BsArrowLeft } from "react-icons/bs";
import { UserRole, UserCreateDto } from "@/app/types/auth";
import InputField from "@/components/InputField";
import Header from "@/components/Header";
import { useAuth } from "@/app/context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import { PulseLoader } from "react-spinners";
import { loginUser } from "@/app/api/auth";
import { uploadProfileImage, saveUserProfileImage } from "@/app/api/upload";

const Signup: React.FC = () => {
  const [role, setRole] = useState<UserRole | "">("");
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [formData, setFormData] = useState<UserCreateDto>({
    firstName: "",
    lastName: "",
    email: "",
    role: UserRole.USER,
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, error, clearError } = useAuth();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    "/assets/placeholders/avatar.png"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds the 10MB limit.");
        return;
      }

      setProfileImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const goToNextStep = () => {
    if (swiperInstance) swiperInstance.slideNext();
  };

  const goToPrevSlide = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  const handleRoleSelection = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setFormData({ ...formData, role: selectedRole });
    goToNextStep();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData({
        ...formData,
        [name]: name === "studentNumber" ? Number(value) : value,
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔍 **Form Validation**
    const errors = [];
    if (!formData.firstName.trim()) errors.push("First Name is required.");
    if (!formData.lastName.trim()) errors.push("Last Name is required.");
    if (!formData.email.trim()) errors.push("Email is required.");
    if (!formData.password.trim()) errors.push("Password is required.");
    if (formData.password !== confirmPassword)
      errors.push("Passwords do not match.");

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Registering user...");

      const userResponse = await register(formData);
      if (!userResponse) throw new Error("User registration failed");

      let imageUrl = "";

      if (profileImage) {
        console.log("Uploading profile image...");

        try {
          imageUrl = await uploadProfileImage(profileImage);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (error) {
          console.error("Image Upload Error:", error);
          toast.error("Image upload failed, but signup was successful.");
        }
      }

      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (imageUrl) {
        await saveUserProfileImage(loginResponse.user.id, imageUrl);

      }

      toast.success("Signup completed successfully! 🎉");

      router.push(
        formData.role === UserRole.USER ? "/participant" : "/coordinator"
      );
    } catch (error) {
      toast.error(
        (error as Error).message || "Signup failed. Please try again."
      );
      console.error("Signup Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-primary flex flex-col mt-20">
        <div className="flex justify-center items-center flex-grow py-5">
          <Toaster position="top-right" />
          <Card className="lg:w-full w-[95vw] lg:max-w-[50vw] p-4 shadow-md">
            <CardHeader />
            <CardContent className="">
              <Swiper onSwiper={setSwiperInstance} allowTouchMove={false}>
                <SwiperSlide className="m-auto h-full">
                  <div className="text-center mx-auto">
                    <h2 className="text-xl font-bold mb-4">Select Your Role</h2>
                    <div className="flex mx-auto justify-around">
                      <Button
                        onClick={() => handleRoleSelection(UserRole.USER)}
                        className="w-[40%] text-xl h-10"
                      >
                        Participant
                      </Button>
                      <Button
                        onClick={() => handleRoleSelection(UserRole.ADMIN)}
                        className="w-[40%] text-xl h-10"
                      >
                        Coordinator
                      </Button>
                    </div>
                    <Link href={"/auth/login"}>
                      <p className="mt-5 text-dark/60 hover:underline hover:text-dark transition-all duration-200 text-center">
                        Already have an account? Login
                      </p>
                    </Link>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <Button
                    onClick={goToPrevSlide}
                    className="flex items-center space-x-2 absolute"
                    variant="outline"
                  >
                    <BsArrowLeft className="text-xl text-gray-700 hover:text-black" />
                  </Button>
                  {role === UserRole.USER && (
                    <ParticipantForm
                      formData={formData}
                      onChange={handleChange}
                      onSubmit={handleSignup}
                      confirmPassword={confirmPassword}
                      handleImageChange={handleImageChange}
                      previewUrl={previewUrl}
                      isSubmitting={isSubmitting}
                    />
                  )}
                  {role === UserRole.ADMIN && (
                    <CoordinatorForm
                      formData={formData}
                      onChange={handleChange}
                      onSubmit={handleSignup}
                      confirmPassword={confirmPassword}
                      handleImageChange={handleImageChange}
                      previewUrl={previewUrl}
                      isSubmitting={isSubmitting}
                    />
                  )}
                  {error && <p className="text-red-500 mt-4">{error}</p>}
                </SwiperSlide>
              </Swiper>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface FormProps {
  formData: UserCreateDto;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl?: string;
  isSubmitting: boolean;
}

const ParticipantForm: React.FC<FormProps> = ({
  formData,
  onChange,
  onSubmit,
  confirmPassword,
  handleImageChange,
  previewUrl,
  isSubmitting,
}) => (
  <form
    className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-8"
    onSubmit={onSubmit}
    noValidate
  >
    <h2 className="col-span-2 text-xl font-bold text-center mb-4">
      Participant Signup
    </h2>

    <div className="flex flex-col items-center gap-3 mt-4 row-span-2">
      <img
        src={previewUrl}
        alt="Profile Preview"
        className="w-32 h-32 object-cover rounded-full border-2 border-gray-300 shadow-md"
      />

      <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded shadow-md hover:bg-primary/80 transition">
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
    />
    <InputField
      id="lastName"
      label="Last Name*"
      value={formData.lastName}
      onChange={onChange}
      required={true}
      placeholder="Enter your last name"
    />
    <InputField
      id="email"
      label="Main Email*"
      value={formData.email}
      onChange={onChange}
      required={true}
      placeholder="Enter your main email"
    />
    <InputField
      id="uniEmail"
      label="University Email"
      value={formData.uniEmail || ""}
      onChange={onChange}
      required={false}
      placeholder="Enter your university email"
    />
    <InputField
      id="password"
      label="Password*"
      type="password"
      value={formData.password}
      onChange={onChange}
      required={true}
      placeholder="Enter your password"
    />
    <InputField
      id="confirmPassword"
      label="Confirm Password*"
      type="password"
      value={confirmPassword}
      onChange={onChange}
      required={true}
      placeholder="Confirm your password"
    />
    <InputField
      id="studentNumber"
      label="Student Number"
      value={formData.studentNumber?.toString() || ""}
      onChange={onChange}
      required={false}
      placeholder="Enter your student number"
    />
    <InputField
      id="joinCode"
      label="Organisation Join Code"
      value={formData.joinCode?.toString() || ""}
      onChange={onChange}
      required={true}
      placeholder="Enter your organisation join code"
    />
    <Button type="submit" className="w-full h-12 text-xl col-span-2">
      {isSubmitting ? "Signing Up..." : "Signup"}
    </Button>
  </form>
);

const CoordinatorForm: React.FC<FormProps> = ({
  formData,
  onChange,
  onSubmit,
  confirmPassword,
  handleImageChange,
  previewUrl,
  isSubmitting,
}) => {
  const [orgExists, setOrgExists] = useState("yes");
  const [confirmEmail, setConfirmEmail] = useState<string>("");

  const handleOrgExistsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrgExists(e.target.value);
  };

  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email !== confirmEmail) {
      toast.error("Emails do not match.");
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
          className="w-32 h-32 object-cover rounded-full border-2 border-gray-300 shadow-md"
        />

        <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary/80 transition">
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
      />
      <InputField
        id="lastName"
        label="Last Name*"
        value={formData.lastName}
        onChange={onChange}
        required={true}
        placeholder="Enter your last name"
      />
      <InputField
        id="email"
        label="University Email*"
        value={formData.email}
        onChange={onChange}
        required={true}
        placeholder="Enter your university/work email"
      />
      <InputField
        id="confirmEmail"
        label="Confirm Email*"
        value={confirmEmail}
        onChange={handleConfirmEmailChange}
        required={true}
        placeholder="Confirm your university/work email"
      />
      <InputField
        id="password"
        label="Password*"
        type="password"
        value={formData.password}
        onChange={onChange}
        required={true}
        placeholder="Enter your password"
      />
      <InputField
        id="confirmPassword"
        label="Confirm Password*"
        type="password"
        value={confirmPassword}
        onChange={onChange}
        required={true}
        placeholder="Confirm your password"
      />
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
              onChange={handleOrgExistsChange}
              className="form-radio"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="orgExists"
              value="no"
              checked={orgExists === "no"}
              onChange={handleOrgExistsChange}
              className="form-radio"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {orgExists === "yes" && (
        <InputField
          id="joinCode"
          label="Organisation Join Code*"
          value={formData.joinCode || ""}
          onChange={onChange}
          required={orgExists === "yes"}
          placeholder="Enter your join code"
        />
      )}

      <Button type="submit" className="w-full h-12 text-xl col-span-2">
        {isSubmitting ? "Signing Up..." : "Signup"}
      </Button>
    </form>
  );
};

export default Signup;
