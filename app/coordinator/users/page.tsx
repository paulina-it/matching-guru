"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUsersInOrganisation } from "@/app/api/users";
import { useAuth } from "@/app/context/AuthContext";
import { FaUser, FaUserShield } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import InviteOrAssignCoordinatorDialog from "@/components/AddCoordinator";

const UserListComponent = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | "admin" | "user">(
    "all"
  );
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchData = async () => {
    if (!user?.organisationId) return;
    setLoading(true);
    try {
      const response = await fetchUsersInOrganisation(
        user.organisationId,
        searchQuery,
        selectedRole,
        sortBy,
        sortOrder,
        page,
        pageSize
      );
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    user?.organisationId,
    searchQuery,
    selectedRole,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  return (
    <div className="p-6 mt-[5em] bg-white dark:bg-dark border rounded-lg shadow-md min-h-[70vh] min-w-[60vw] relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Input
          className="w-[300px]"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
        />
        <div className="flex gap-2">
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Users / page" />
            </SelectTrigger>
            <SelectContent>
              {[20, 30, 50, 100].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="firstName">First Name</SelectItem>
              <SelectItem value="lastName">Last Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="createdAt">Join Date</SelectItem>
              <SelectItem value="role">Role</SelectItem>
              <SelectItem value="lastLogin">Last Login</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={selectedRole}
        onValueChange={(val) => {
          setSelectedRole(val as "all" | "admin" | "user");
          setPage(0);
        }}
      >
        <TabsList className="mb-4 absolute -top-10 max-h-10">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="user">Participants</TabsTrigger>
        </TabsList>
      </Tabs>
      {user?.organisationId && (
        <InviteOrAssignCoordinatorDialog
          currentUser={{id: user.id, organisationId:user.organisationId}}
          onSuccess={fetchData}
        />
      )}
      {loading ? (
        <div className="flex justify-center py-10">
          <PulseLoader color="#3498db" />
        </div>
      ) : (
        <>
          <UserTable data={users} />
          <div className="flex justify-center gap-4 mt-6">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="self-center font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const UserTable = ({ data }: { data: any[] }) => {
  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">No users found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow
            key={user.id}
            className="cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() =>
              (window.location.href = `/coordinator/users/${user.id}`)
            }
          >
            <TableCell className="font-medium flex items-center gap-2">
              {user.role === "ADMIN" ? <FaUserShield /> : <FaUser />}{" "}
              {user.firstName} {user.lastName}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">
              {user.role === "ADMIN" ? "Admin" : "Participant"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserListComponent;
