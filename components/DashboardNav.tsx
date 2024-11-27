"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiFillHome, AiOutlineFileText } from "react-icons/ai";
import { FiUser, FiSettings } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { RiProjectorLine } from "react-icons/ri";

type Props = {
  type: "coordinator" | "participant";
};


type LinkType = {
    route: string;
    name: string;
    icon: React.ReactElement;
  };

const coordinatorLinks = [
  {
    route: "/coordinator",
    name: "Home",
    icon: <AiFillHome />,
    content: "",
  },
  {
    route: "/coordinator/organisation",
    name: "Organisation",
    icon: <FaBuilding />,
    content: "",
  },
  {
    route: "/coordinator/organisation/programmes",
    name: "Programmes",
    icon: <RiProjectorLine />,
    content: "",
  },
  {
    route: "/coordinator/reports",
    name: "Reports",
    icon: <AiOutlineFileText />,
    content: "",
  },
  {
    route: "/coordinator/account",
    name: "Account",
    icon: <FiUser />,
    content: "",
  },
  {
    route: "/coordinator/account/settings",
    name: "Settings",
    icon: <FiSettings />,
    content: "",
  },
];

const DashboardNav = ({ type }: Props) => {
  const pathname = usePathname();
  let links: Array<LinkType> = []; 
  if (type === "coordinator") {
    links = coordinatorLinks;
  }

  return (
    <div className="container min-h-[100%] w-[10vw] pt-20 left-0 top-0 bg-light md:w-[20em] fixed z-10">
      <Image
        src="/assets/ui/logo(yy).png"
        width={70}
        height={70}
        alt="Logo"
        className="m-auto"
        priority
      />
      <div className="flex flex-col xl:flex-row gap-[60px] mt-10">
        <div className="flex flex-col w-full max-w-[380px] mx-auto xl:mx-0 gap-6">
          {links.map((link, index) => (
            <Link key={index} href={link.route} passHref
                className={`flex items-center gap-5 p-2 rounded-[5px] transition-colors ${
                  pathname === link.route
                    ? "bg-primary text-white text-lg" // Active link style
                    : "hover:bg-primary/20" // Default hover style
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardNav;
