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
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  accept
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
    />
  </div>
);

export default InputField;