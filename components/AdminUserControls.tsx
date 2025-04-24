import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserResponseDto, UserRole, UserUpdateDto } from "@/app/types/auth";
import { formatText } from "@/app/utils/text";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-hot-toast";

type Props = {
    user: UserResponseDto;
    onUpdate: (updated: Partial<UserUpdateDto>) => void;
  };
  
export const AdminUserControls = ({ user, onUpdate }: Props) => {
  const { user: currentUser } = useAuth();
  const [role, setRole] = useState<UserRole>(user.role);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [studentNumber, setStudentNumber] = useState(
    user.studentNumber?.toString() || ""
  );

  const handleSave = () => {
    const updated: Partial<UserResponseDto> = {
      firstName,
      lastName,
      email,
      studentNumber: studentNumber ? parseInt(studentNumber) : undefined,
      role,
    };
    onUpdate(updated);
    toast.success("User updated");
  };

  const disableRoleChange = currentUser?.id === user.id;

  return (
    <div className="mt-10 border-t pt-6">
      {" "}
      <h3 className="text-xl font-semibold mb-4">🔧 Admin Controls</h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Student Number</label>
          <Input
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <Select
            value={role}
            onValueChange={(val) => setRole(val as UserRole)}
            disabled={disableRoleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Participant</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          {disableRoleChange && (
            <p className="text-xs text-muted-foreground mt-1">
              You cannot change your own role.
            </p>
          )}
        </div>
      </div>
      <Button className="m-auto" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
};
