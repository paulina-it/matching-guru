"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BsArrowLeft } from "react-icons/bs";
import { UserRole, UserCreateDto } from "@/app/types/auth";
import { registerUser } from "@/app/api/auth";

const Signup: React.FC = () => {
  const [role, setRole] = useState<UserRole | "">("");
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserCreateDto>({
    firstName: "",
    lastName: "",
    email: "",
    role: UserRole.USER,
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();

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

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    try {
      const response = await registerUser(formData);
      localStorage.setItem("token", response.token);
      console.log("Logged in successfully", response.user);
      if (formData.role === UserRole.USER) {
        router.push("/participant");
      } else if (formData.role === UserRole.ADMIN) {
        router.push("/coordinator");
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-secondary">
      <Card className="relative w-full max-w-[50vw] p-4 shadow-md">
        <CardHeader />
        <CardContent>
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
                className="flex items-center space-x-2"
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
                />
              )}
              {role === UserRole.ADMIN && (
                <CoordinatorForm
                  formData={formData}
                  onChange={handleChange}
                  onSubmit={handleSignup}
                  confirmPassword={confirmPassword}
                />
              )}
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </SwiperSlide>
          </Swiper>
        </CardContent>
      </Card>
    </div>
  );
};

interface FormProps {
  formData: UserCreateDto;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ParticipantForm: React.FC<FormProps> = ({
  formData,
  onChange,
  onSubmit,
  confirmPassword,
}) => (
  <form className="grid md:grid-cols-2 gap-4 gap-y-8" onSubmit={onSubmit}>
    <h2 className="col-span-2 text-xl font-bold text-center mb-4">
      Participant Signup
    </h2>
    <InputField
      id="firstName"
      label="First Name*"
      value={formData.firstName}
      onChange={onChange}
    />
    <InputField
      id="lastName"
      label="Last Name*"
      value={formData.lastName}
      onChange={onChange}
    />
    <InputField
      id="email"
      label="Personal Email*"
      value={formData.email}
      onChange={onChange}
    />
    <InputField
      id="uniEmail"
      label="University Email"
      value={formData.uniEmail || ""}
      onChange={onChange}
    />
    <InputField
      id="password"
      label="Password*"
      type="password"
      value={formData.password}
      onChange={onChange}
    />
    <InputField
      id="confirmPassword"
      label="Confirm Password*"
      type="password"
      value={confirmPassword}
      onChange={onChange}
    />
    <InputField
      id="studentNumber"
      label="Student Number"
      value={formData.studentNumber?.toString() || ""}
      onChange={onChange}
    />
    <Button type="submit" className="w-full h-12 text-xl col-span-2">
      Signup
    </Button>
  </form>
);

const CoordinatorForm: React.FC<FormProps> = ({
  formData,
  onChange,
  onSubmit,
  confirmPassword,
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
      alert("Emails do not match.");
      return;
    }

    onSubmit(e);
  };
  return (
    <form className="grid md:grid-cols-2 gap-4 gap-y-8" onSubmit={handleSubmit}>
      <h2 className="col-span-2 text-xl font-bold text-center mb-4">
        Coordinator Signup
      </h2>
      <InputField
        id="firstName"
        label="First Name*"
        value={formData.firstName}
        onChange={onChange}
      />
      <InputField
        id="lastName"
        label="Last Name*"
        value={formData.lastName}
        onChange={onChange}
      />
      <InputField
        id="email"
        label="University Email*"
        value={formData.email}
        onChange={onChange}
      />
      <InputField
        id="confirmEmail"
        label="Confirm Email*"
        value={confirmEmail}
        onChange={handleConfirmEmailChange}
      />
      <InputField
        id="password"
        label="Password*"
        type="password"
        value={formData.password}
        onChange={onChange}
      />
      <InputField
        id="confirmPassword"
        label="Confirm Password*"
        type="password"
        value={confirmPassword}
        onChange={onChange}
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
          label="Organisation Join Code"
          value={formData.joinCode || ""}
          onChange={onChange}
        />
      )}

      <Button type="submit" className="w-full h-12 text-xl col-span-2">
        Signup
      </Button>
    </form>
  );
};

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
}) => (
  <div className="col-span-2 md:col-span-1">
    <label htmlFor={id} className="block mb-1 text-gray-700">
      {label}
    </label>
    <Input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={`Enter your ${label.toLowerCase()}`}
      required
    />
  </div>
);

export default Signup;
