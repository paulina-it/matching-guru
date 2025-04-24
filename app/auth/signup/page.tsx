"use client";

import { useRef, useState, useEffect } from "react";
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
import { useSearchParams } from "next/navigation";
import { ParticipantForm } from "@/components/forms/ParticipantSignup";
import { CoordinatorForm } from "@/components/forms/CoordinatorSignup";

const Signup: React.FC = () => {
  const [role, setRole] = useState<UserRole | "">("");
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
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const swiperRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [orgExists, setOrgExists] = useState<"yes" | "no">("yes");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  useEffect(() => {
    const checkInvite = async () => {
      if (!inviteToken) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invites/validate?token=${inviteToken}`
        );
        if (!res.ok) throw new Error("Invalid or expired invite");
        const data = await res.json();

        setFormData((prev) => ({
          ...prev,
          email: data.email,
          organisationId: data.organisationId,
          role: UserRole.ADMIN,
        }));

        setConfirmEmail(data.email);
        setRole(UserRole.ADMIN);
        setTimeout(() => swiperRef.current?.slideTo(1), 100);
      } catch (err) {
        toast.error("Invalid or expired invite link.");
        router.push("/auth/login");
      }
    };

    checkInvite();
  }, [inviteToken]);

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
      errors.push(
        "Join code is required. Ask your university's mentoring coordinator."
      );
      invalids.push("joinCode");
    }

    if (
      role === UserRole.ADMIN &&
      orgExists === "yes" &&
      !inviteToken &&
      !formData.joinCode?.trim()
    ) {
      errors.push(
        "Join code is required for existing organisations unless you're using an invite link."
      );
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
      const payload = {
        ...formData,
        inviteToken: inviteToken || undefined,
      };
  
      const userResponse = await register(payload);
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
                      confirmEmail={confirmEmail} 
                      setConfirmEmail={setConfirmEmail}
                      orgExists={orgExists}
                      setOrgExists={setOrgExists}
                      hasInvite={!!inviteToken}
                    />
                  )}
                  {error && (
                    <p className="text-red-500 mt-4 mx-auto">{error}</p>
                  )}
                </SwiperSlide>
              </Swiper>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
