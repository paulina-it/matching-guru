"use client";

import { useRef, useState } from "react";
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
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const swiperRef = useRef<any>(null);

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
    swiperRef.current?.slideNext();
  };

  const goToPrevSlide = () => {
    swiperRef.current?.slidePrev();
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
      const parsedValue = name === "studentNumber" ? Number(value) : value;
      setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    }    
  };

  const showErrors = (messages: string[]) =>
    messages.forEach((msg) => toast.error(msg));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const errors: string[] = [];
    const invalids: string[] = [];

    if (!formData.firstName.trim()) {
      errors.push("First Name is required.");
      invalids.push("firstName");
    }

    if (!formData.lastName.trim()) {
      errors.push("Last Name is required.");
      invalids.push("lastName");
    }

    if (!formData.email.trim()) {
      errors.push("Email is required.");
      invalids.push("email");
    } else if (!validateEmail(formData.email)) {
      errors.push("Invalid email format.");
      invalids.push("email");
    }

    if (!formData.password) {
      errors.push("Password is required.");
      invalids.push("password");
    } else if (!validatePassword(formData.password)) {
      errors.push(
        "Password must be at least 8 characters and include a number, uppercase and lowercase letter."
      );
      invalids.push("password");
    }

    if (!confirmPassword) {
      errors.push("Confirm your password.");
      invalids.push("confirmPassword");
    } else if (formData.password !== confirmPassword) {
      errors.push("Passwords do not match.");
      invalids.push("password", "confirmPassword");
    }

    if (role === UserRole.USER && !formData.joinCode?.trim()) {
      errors.push("Join code is required. Ask your university's mentoring coordinator.");
      invalids.push("joinCode");
    }

    setInvalidFields(invalids);

    if (errors.length > 0) {
      showErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      setIsSubmitting(true);
      const userResponse = await register(formData);
      if (!userResponse) throw new Error("User registration failed");

      let imageUrl = "";
      if (profileImage) {
        try {
          imageUrl = await uploadProfileImage(profileImage);
        } catch {
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
      router.push(role === UserRole.USER ? "/participant" : "/coordinator");
    } catch (error) {
      toast.error(
        (error as Error).message || "Signup failed. Please try again."
      );
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
      <div className="min-h-screen bg-primary dark:bg-primary-dark flex flex-col mt-20">
        <div className="flex justify-center items-center flex-grow py-5">
          <Toaster position="top-right" />
          <Card className="lg:w-full w-[95vw] lg:max-w-[50vw] p-4 shadow-md">
            <CardHeader />
            <CardContent className="">
              <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                allowTouchMove={false}
              >
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
                      <p className="mt-5 text-dark/60 dark:text-light hover:underline hover:text-dark transition-all duration-200 text-center">
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
                      invalidFields={invalidFields}
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
                      invalidFields={invalidFields}
                    />
                  )}
                  {error && <p className="text-red-500 mt-4 mx-auto">{error}</p>}
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
  invalidFields: string[];
}

const ParticipantForm: React.FC<FormProps> = ({
  formData,
  onChange,
  onSubmit,
  confirmPassword,
  handleImageChange,
  previewUrl,
  isSubmitting,
  invalidFields,
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
      label="Email*"
      value={formData.email}
      onChange={onChange}
      required={true}
      placeholder="e.g. abc123@university.ac.uk"
      hasError={invalidFields.includes("email")}
    />
    {/* <InputField
      id="uniEmail"
      label="University Email"
      value={formData.uniEmail || ""}
      onChange={onChange}
      required={false}
      placeholder="Enter your university email"
      hasError={invalidFields.includes("uniEmail")}
    /> */}
    <p className="text-sm text-gray-500 mt-2">
      Use your university email if you have one — otherwise, a personal email is
      fine.
    </p>

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
    <InputField
      id="studentNumber"
      label="Student Number (If Available)"
      value={formData.studentNumber?.toString() || ""}
      onChange={onChange}
      required={false}
      placeholder="Enter your student number"
      hasError={invalidFields.includes("studentNumber")}
    />
    <InputField
      id="joinCode"
      label="Join Code*"
      value={formData.joinCode?.toString() || ""}
      onChange={onChange}
      required={true}
      placeholder="Ask your mentoring coordinator"
      hasError={invalidFields.includes("joinCode")}
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
  invalidFields,
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
    if (formData.email.toLowerCase() !== confirmEmail.toLowerCase()) {
      toast.error("Emails do not match.");
      return;
    }
    if (
      formData.role === UserRole.ADMIN &&
      orgExists === "yes" &&
      !formData.joinCode?.trim()
    ) {
      toast.error("Join code is required for existing organisations.");
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
          hasError={invalidFields.includes("joinCode")}
        />
      )}

      <Button type="submit" className="w-full h-12 text-xl col-span-2">
        {isSubmitting ? "Signing Up..." : "Signup"}
      </Button>
    </form>
  );
};

export default Signup;
