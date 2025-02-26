"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiFillHome, AiOutlineFileText } from "react-icons/ai";
import { FiUser, FiSettings } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { RiProjectorLine } from "react-icons/ri";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  type: "coordinator" | "participant";
  onCollapse: (collapsed: boolean) => void;
};

type LinkType = {
  route: string;
  name: string;
  icon: React.ReactElement;
  disabled?: boolean;
};

const coordinatorLinks = [
  { route: "/coordinator", name: "Home", icon: <AiFillHome /> },
  { route: "/coordinator/organisation", name: "Organisation", icon: <FaBuilding /> },
  { route: "/coordinator/programmes", name: "Programmes", icon: <RiProjectorLine /> },
  { route: "/coordinator/reports", name: "Reports", icon: <AiOutlineFileText /> },
  { route: "/coordinator/account", name: "Account", icon: <FiUser /> },
  { route: "/coordinator/account/settings", name: "Settings", icon: <FiSettings /> },
];

const participantLinks = [
  { route: "/participant", name: "Home", icon: <AiFillHome /> },
  { route: "/participant/organisation", name: "Organisation", icon: <FaBuilding /> },
  { route: "/participant/programmes", name: "Programmes", icon: <RiProjectorLine /> },
  { route: "/participant/account", name: "Account", icon: <FiUser /> },
  { route: "/participant/account/settings", name: "Settings", icon: <FiSettings /> },
];

const DashboardNav = ({ type, onCollapse }: Props) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  let links: Array<LinkType> = type === "coordinator" ? coordinatorLinks : participantLinks;
  
  links = links.map((link) => ({
    ...link,
    disabled: !user?.organisationName && link.name !== "Home" && link.name !== "Organisation",
  }));

  const handleCollapse = () => {
    setCollapsed(!collapsed);
    onCollapse(!collapsed);
  };

  return (
    <Card className={`fixed min-h-full z-10 transition-all duration-300 ${collapsed ? "w-[4rem]" : "w-[15rem]"}`}
    >
      <div className="flex flex-col items-center pt-5">
        <Image
          src="/assets/ui/logo(yy).png"
          width={70}
          height={70}
          alt="Logo"
          className="m-auto p-1"
          priority
        />
        <Button
          variant="outline"
          className="mt-5 rounded-full"
          onClick={handleCollapse}
        >
          {collapsed ? <IoMdArrowDropright size={24} /> : <IoMdArrowDropleft size={24} />}
        </Button>
      </div>

      <nav className="mt-10 flex flex-col items-center gap-4">
        {links.map((link, index) => (
          <Link
            key={index}
            href={!link.disabled ? link.route : "#"}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              pathname === link.route
                ? "bg-primary text-white"
                : link.disabled
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-primary/20"
            } ${collapsed ? "justify-center w-[4rem]" : "px-4 w-full"}`}
          >
            {link.icon}
            {!collapsed && <span>{link.name}</span>}
          </Link>
        ))}
      </nav>
    </Card>
  );
};

export default DashboardNav;
