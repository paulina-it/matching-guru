import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FormProps {
  name: string;
  desc: string;
  error: string | null;
  previewUrl?: string;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setName: (name: string) => void;
  setDesc: (desc: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const OrganisationForm: React.FC<FormProps> = ({
  name,
  desc,
  error,
  previewUrl = "/assets/placeholders/avatar.png",
  handleImageChange,
  setName,
  setDesc,
  onSubmit,
}) => (
  <form
    className="max-w-[40em] min-w-[30em] bg-light dark:bg-dark dark:border dark:border-white/30  rounded-[5px] px-6 py-7 flex flex-col gap-5"
    onSubmit={onSubmit}
  >
    <h2 className="text-xl font-bold text-center mb-4">
      Create an Organisation
    </h2>

    <div className="flex flex-col items-center gap-3 mt-4 row-span-2">
      <img
        src={previewUrl}
        alt="Profile Preview"
        className="w-32 h-32 object-cover rounded-full border-2 border-gray-300 shadow-md"
      />

      <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded shadow-md hover:bg-primary/80 transition">
        Add Organisation Logo
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>
    </div>
    <InputField
      id="name"
      label="Organisation Name*"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
      placeholder="Enter organisation name"
    />

    <label htmlFor="description" className="text-gray-700 mb-[-1em]">
      Description*
    </label>
    <Textarea
      id="description"
      value={desc}
      onChange={(e) => setDesc(e.target.value)}
      placeholder="Enter description"
    />

    <Button type="submit" className="w-full h-12 text-xl">
      Submit
    </Button>

    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
  </form>
);

export default OrganisationForm;
