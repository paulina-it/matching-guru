import { UserCreateDto } from "@/app/types/auth";
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
  }
  
export  const ParticipantForm: React.FC<FormProps> = ({
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
  