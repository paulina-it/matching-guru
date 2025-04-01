import { Input } from "@/components/ui/input";

interface InputFieldProps {
  id: string;
  label: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  accept?: string;
  hasError?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  accept,
  hasError,
}) => (
  <div className="col-span-2 md:col-span-1">
    <label htmlFor={id} className="block mb-1 text-gray-700 dark:text-light">
      {label}
    </label>
    <Input
      id={id}
      name={id}
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      accept={accept}
      {...(type !== "file" && { value })}
      className={`border rounded px-3 py-2 w-full ${
        hasError ? "border-accent" : "border-gray-300"
      }`}
    />
  </div>
);

export default InputField;
