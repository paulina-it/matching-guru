import { Input } from "@/components/ui/input";

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required: boolean;
  placeholder: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder
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
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default InputField;