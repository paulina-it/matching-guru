"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AiFillHome, AiOutlineFileText } from "react-icons/ai";
import { FiUser, FiSettings } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { RiProjectorLine } from "react-icons/ri";
import { CiMenuFries } from "react-icons/ci";
import { useAuth } from "@/app/context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

type Props = {
  type: "coordinator" | "participant";
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

const MobileNav = ({ type }: Props) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  let links: Array<LinkType> = type === "coordinator" ? coordinatorLinks : participantLinks;
  
  links = links.map((link) => ({
    ...link,
    disabled: !user?.organisationName && link.name !== "Home" && link.name !== "Organisation",
  }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="fixed top-5 left-5 z-50 p-2 rounded-md">
        <CiMenuFries className="text-white text-[32px]" />
      </SheetTrigger>

      <SheetContent className="flex flex-col items-center text-center bg-light">
        {/* Logo & Theme Toggle */}
        <div className="mt-5 mb-10 flex flex-col items-center">
          <Image
            src="/assets/ui/logo(yy).png"
            width={70}
            height={70}
            alt="Logo"
            priority
          />
          {/* <ThemeToggle /> */}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-5 w-full items-center">
          {links.map((link, index) => (
            <Link
              key={index}
              href={!link.disabled ? link.route : "#"}
              className={`flex items-center gap-3 w-full px-5 py-3 rounded text-lg transition-colors ${
                pathname === link.route
                  ? "bg-primary text-white"
                  : link.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-primary/20"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Close Button */}
        {/* <Button className="mt-10" variant="secondary" onClick={() => setOpen(false)}>
          Close Menu
        </Button> */}
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
